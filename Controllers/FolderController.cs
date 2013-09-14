using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;

namespace Wachak.Controllers
{
    public class FolderController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<controller>/5
        public HttpResponseMessage Get(string id)
        {
            if (string.IsNullOrEmpty(id))
                return null;

            waachakDBEntities db = new waachakDBEntities();
            var subL = from sub in db.Subscriptions
                       join wUsers in db.WaachakUsers on sub.UserID equals wUsers.UserID
                       where wUsers.UserID == id 
                       && sub.IsFolder == 1
                       select new {id = sub.Id, name = sub.Name, url = sub.Url };

            var oSerializer = new System.Web.Script.Serialization.JavaScriptSerializer();
            string sJSON = oSerializer.Serialize(subL);

            var resp = new HttpResponseMessage()
            {
                Content = new StringContent(sJSON)
            };
            resp.Content.Headers.ContentType = new MediaTypeHeaderValue("application/json");
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