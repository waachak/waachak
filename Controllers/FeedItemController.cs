using System;
using System.Collections.Generic;
using System.Data.Entity.Validation;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.Serialization.Json;
using System.Web.Http;
using System.Xml.Linq;

namespace Wachak.Controllers
{
    public class FeedItemController : ApiController
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
            // Mark item as read 
             if (sub == null || sub.items == null || sub.items.Count == 0 || sub.items[0].isItemRead == 1)
                 return;
            
             // Validate User
             if (!Wachak.Classes.Crypto.IsLoggedInUser(sub.userID, sub.authToken))
                 return;

            waachakDBEntities db = new waachakDBEntities();

            string strGuid = sub.items[0].guid;
            var fii = (from f in db.FeedItems
                  where f.userID == sub.userID && f.guid == strGuid
                  select f).FirstOrDefault();

            if (fii == null)
            {
                Wachak.FeedItem fi = null;

                fi = new Wachak.FeedItem();
                fi.guid = sub.items[0].guid;
                fi.link = sub.items[0].link;
                fi.pubDate = sub.items[0].pubDate;
                fi.title = sub.items[0].title;
                fi.userID = sub.userID;
                fi.savedForReading = sub.savedForReading;
                fi.feedName = sub.feedName;

                db.FeedItems.Add(fi); 
            }
            else
            {
                fii.savedForReading = sub.savedForReading;
                if (sub.savedForReading == 1)
                {
                    fii.title = sub.items[0].title;
                    fii.feedName = sub.feedName;
                }
                else
                    fii.title = "";
            }
            
            db.SaveChanges();            
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