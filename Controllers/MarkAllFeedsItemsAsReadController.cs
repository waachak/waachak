using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Wachak.Classes
{
    public class MarkAllFeedsItemsAsReadController : ApiController
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
        public void Post(Wachak.Classes.Subscription sub)
        {
            if (sub == null)
                return;
           
            if (!Wachak.Classes.Crypto.IsLoggedInUser(sub.userID, sub.authToken))
                return;

           // string strUrl = sub.url;
            List<Wachak.Classes.FeedItem> items = sub.items;

            if (items != null)
            {
                try
                {
                    waachakDBEntities db = new waachakDBEntities();
                    foreach (Wachak.Classes.FeedItem i in items)
                    {
                        Wachak.FeedItem fi = new Wachak.FeedItem();
                        fi.userID = sub.userID;
                        fi.guid = i.guid;
                        fi.link = i.link;
                        fi.title = i.title;
                        fi.pubDate = i.pubDate;
                        db.FeedItems.Add(fi);
                    }
                    db.SaveChanges();
                }
                catch (DbEntityValidationException)
                {
                }
            }
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