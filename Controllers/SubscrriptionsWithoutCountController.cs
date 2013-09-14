using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;

namespace Wachak.Controllers
{
    public class SubscrriptionsWithoutCountController : ApiController
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

            waachakDBEntities db = new waachakDBEntities();
            var subL = from s in db.Subscriptions
                       join wUsers in db.WaachakUsers on s.UserID equals wUsers.UserID
                       orderby s.SortNumber
                       where wUsers.UserID == sub.userID
                       select new { name = s.Name, url = s.Url, ID = s.Id };

            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            string sJSON = oSerializer.Serialize(subL);

            var resp = new HttpResponseMessage()
            {
                Content = new StringContent(sJSON)
            };
            resp.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
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