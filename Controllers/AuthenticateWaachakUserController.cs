using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Wachak.Controllers
{
    public class AuthenticateWaachakUserController : ApiController
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
        public HttpResponseMessage Post(Wachak.Classes.WaachakUser value)
        {
            var resp = new HttpResponseMessage();

            try
            {
                if (value == null)
                    return null;

                string sJson = "";

                string strPassword = Wachak.Classes.Crypto.EncryptString(value.password);
              
                waachakDBEntities db = new waachakDBEntities();
                Wachak.WaachakUser wu = null;

                if (!string.IsNullOrEmpty(value.authToken))
                {
                    wu = (from u in db.WaachakUsers
                          where u.UserID == value.userID && u.UserToken == value.authToken
                          select u
                             ).FirstOrDefault();
                }
                else
                { 
                    wu = (from u in db.WaachakUsers
                          where u.UserID == value.userID && u.UserPassword == strPassword
                             select u
                             ).FirstOrDefault();
                }

                if (wu != null)
                {
                    string strAuthToken = Wachak.Classes.Crypto.CreateToken(value.userID + strPassword);
                    wu.UserToken = strAuthToken;
                    db.SaveChanges();

                    var uj = new {  UserID = wu.User_Name,
                                    User_Name = wu.User_Name, 
                                    userImageUrl = @"Images/reader.jpg", 
                                    authToken = strAuthToken};
                    sJson = JsonConvert.SerializeObject(uj);
                }
                else
                {
                    var uj = new { UserID = "", User_Name = "", userImageUrl = "", authToken = "" };
                    sJson = JsonConvert.SerializeObject(uj);
 
                }

                resp = new HttpResponseMessage()
                {
                    Content = new StringContent(sJson)
                };
            }
            catch (Exception ex)
            {
                resp = new HttpResponseMessage()
                {
                    Content = new StringContent(ex.Message)
                };
            }

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