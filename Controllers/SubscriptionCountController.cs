using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Xml.Linq;

namespace Wachak.Controllers
{
    public class SubscriptionCountController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<controller>/5
        public void Get(string id)
        {
           
        }

        // POST api/<controller>
        public HttpResponseMessage Post(Wachak.Classes.Subscription value)
        {
            if (value == null)
                return null;

            List<Wachak.Classes.Subscription> sL = new List<Classes.Subscription>();

            // Valdidate user
            if (!Wachak.Classes.Crypto.IsLoggedInUser(value.userID, value.authToken))
                return null;

            waachakDBEntities db = new waachakDBEntities();
            var subL = from sub in db.Subscriptions
                       orderby sub.SortNumber
                       where sub.UserID == value.userID //&& sub.IsFolder == 0
                       select new { 
                           name = sub.Name, url = sub.Url, unreadCount = 0, 
                           IsFolder = sub.IsFolder, ParentFolder=sub.ParentFolder, 
                           ID = sub.Id};

            foreach (var i in subL)
            {
                if (string.IsNullOrEmpty(i.url))
                    continue;

                Uri uriResult;
                bool result = Uri.TryCreate(i.url, UriKind.Absolute, out uriResult) && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
                if (!result)
                    continue;

                try
                {
                    XDocument doc = XDocument.Load(i.url);
                    var vRet = from item in doc.Descendants("item")
                               select new
                               {
                                   guid = item.Element("link").Value
                               };

                    if (vRet != null && !vRet.Any())
                    {
                        XNamespace n = @"http://www.w3.org/2005/Atom";
                        XElement xe = XElement.Load(i.url);
                        
                        vRet = from item in xe.Elements(n + "entry")
                               select new
                               {
                                    guid = item.Element(n + "link").Attribute("href").Value
                               };
                    }

                    var vDbItems = from dbi in db.FeedItems
                                   where dbi.userID == value.userID
                                   select new { guid = dbi.guid };

                    var vUnread = vRet.Except(vDbItems);

                    Wachak.Classes.Subscription s = new Classes.Subscription();
                    s.name = i.name;
                    s.url = i.url;
                    s.unreadCount = vUnread.Count();
                    s.ID = i.ID;
                    sL.Add(s);
                }
                catch {
                   
                }
            }

            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            string sJSON = oSerializer.Serialize(sL);

            var resp = new HttpResponseMessage()
            {
                Content = new StringContent(sJSON)
            };
            return resp;
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}