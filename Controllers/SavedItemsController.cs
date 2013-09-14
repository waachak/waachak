using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Wachak.Controllers
{
    public class SavedItemsController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<controller>/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<controller>
        public HttpResponseMessage Post(Wachak.Classes.Subscription sub)
        {
            if (sub == null)
                return null;

            List<Wachak.Classes.FeedItem> fL = new List<Classes.FeedItem>();

            // Valdidate user
            if (!Wachak.Classes.Crypto.IsLoggedInUser(sub.userID, sub.authToken))
                return null;

            waachakDBEntities db = new waachakDBEntities();
            var feedL = from fi in db.FeedItems
                       where fi.userID == sub.userID && fi.savedForReading == 1
                       select new
                       {
                           title = fi.title,
                           link = fi.link,
                           description = "",
                           pubDate = fi.pubDate,
                           guid = fi.guid,
                           unreadCount = 0,
                           feedName = fi.feedName,
                           savedItem = 1
                       };

            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            string sJSON = oSerializer.Serialize(feedL);


            string sJsonChannel = @"Saved Items";
            var channel = new[]
                           {  
                              new { title = "Saved Items", link = "" }
                           };

            sJsonChannel = JsonConvert.SerializeObject(channel);
            sJSON = @"{""channel"":" + sJsonChannel + @",""items"":" + sJSON + @"}";
            
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