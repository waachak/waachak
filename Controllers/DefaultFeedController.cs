using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Wachak.Controllers
{
    public class DefaultFeedController : ApiController
    {
        

        // GET api/<controller>/5
        public HttpResponseMessage Get(Wachak.Classes.Subscription sub)
        {
            waachakDBEntities db = new waachakDBEntities();

            var defaultFeeds = from df in db.DefaultFeeds
                               orderby df.sortIndicator
                               select new
                               {
                                   name = df.name,
                                   url = df.feedurl,
                                   isCategory = df.isCategory,
                                   alreadySubscribed = 0
                               };

            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            string sJSON = oSerializer.Serialize(defaultFeeds);

            var resp = new HttpResponseMessage()
            {
                Content = new StringContent(sJSON)
            };

            return resp;
        }

        // POST api/<controller>
        public void Post([FromBody]string value)
        {
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