using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.Serialization.Json;
using System.Web.Http;
using Wachak.Classes;

namespace Wachak.Controllers
{
    public class AuthenticateController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<controller>/5
        public void Get(string value)
        {

        }

        // POST api/<controller>
        public HttpResponseMessage Post([FromBody]string value)
        {
            //Validate Google user
            var resp = new HttpResponseMessage();

            try
            {
                if (string.IsNullOrEmpty(value))
                    return null;
                
                string sJson = "";

                // get user ID from Google
                string jsonResponse = string.Empty;
                string strUrl = @"https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + value;

                // Create the request’s URI.
                Uri serviceUri = new Uri(strUrl, UriKind.Absolute);

                // Return the HttpWebRequest.
                HttpWebRequest webRequest = (HttpWebRequest)System.Net.WebRequest.Create(serviceUri);
                HttpWebResponse response = (HttpWebResponse)webRequest.GetResponse();

                using (StreamReader sr = new StreamReader(response.GetResponseStream()))
                {
                    jsonResponse = sr.ReadToEnd();

                }
                response.Close();

                var t = JsonConvert.DeserializeObject(jsonResponse);
                string strUserID = ((dynamic)((Newtonsoft.Json.Linq.JObject)(t))).user_id;
                
                // Get User Info
                if (!string.IsNullOrEmpty(strUserID))
                {
                    jsonResponse = string.Empty;
                    strUrl = @"https://www.googleapis.com/plus/v1/people/" + strUserID + "?access_token=" + value;

                    // Create the request’s URI.
                    serviceUri = new Uri(strUrl, UriKind.Absolute);

                    // Return the HttpWebRequest.
                    webRequest = (HttpWebRequest)System.Net.WebRequest.Create(serviceUri);
                    response = (HttpWebResponse)webRequest.GetResponse();

                    using (StreamReader sr = new StreamReader(response.GetResponseStream()))
                    {
                        jsonResponse = sr.ReadToEnd();

                    }
                    response.Close();

                    var userInfo = JsonConvert.DeserializeObject(jsonResponse);
                    string strUserName = ((dynamic)((Newtonsoft.Json.Linq.JObject)(userInfo))).displayName;
                    string strImageUrl = ((dynamic)((Newtonsoft.Json.Linq.JObject)(userInfo))).image.url;

                    waachakDBEntities db = new waachakDBEntities ();
                                      
                    var wu = (from u in db.WaachakUsers
                             where u.UserID == strUserID
                             select u).FirstOrDefault();

                    string strToken = "";
                    if (wu == null)
                    {
                        WaachakUser u = new WaachakUser();
                        u.UserID = strUserID;
                        u.User_Name = strUserName;
                        u.UserPassword = "";

                        //strToken = Wachak.Classes.Crypto.CreateToken(strUserID + value);
                        strToken = value;
                        u.UserToken = strToken;
                        db.WaachakUsers.Add(u);
                    }
                    else 
                    {
                        //strToken = Wachak.Classes.Crypto.CreateToken(strUserID + value);
                        strToken = value;
                        wu.UserToken = strToken;
                    }

                    db.SaveChanges();
                    var uj = new { UserID = strUserID, User_Name = strUserName, userImageUrl = strImageUrl, authToken = strToken };

                    sJson = JsonConvert.SerializeObject(uj);
                    resp = new HttpResponseMessage()
                    {
                        Content = new StringContent(sJson)
                    };
                 }
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
        public HttpResponseMessage Put(int id, [FromBody]string value)
        {

            //Validate waachak user
            var resp = new HttpResponseMessage();

            if (string.IsNullOrEmpty(value))
                return null;

            var t = JsonConvert.DeserializeObject(value);
            string strUserID = ((dynamic)((Newtonsoft.Json.Linq.JObject)(t))).userID;
            if (string.IsNullOrEmpty(strUserID))
                return null;

            string strUserName = strUserID;

            string strPassword = ((dynamic)((Newtonsoft.Json.Linq.JObject)(t))).userPassword;
            string strPasswordRepeat = ((dynamic)((Newtonsoft.Json.Linq.JObject)(t))).userPasswordRepeat;
            string strUserEmail = ((dynamic)((Newtonsoft.Json.Linq.JObject)(t))).userEmail;
            
            if (strPassword != strPasswordRepeat)
                return null;
            
            //strUserID = Wachak.Classes.Crypto.EncryptString(strUserID);
            
            waachakDBEntities db = new waachakDBEntities();
            var u = (from wu in db.WaachakUsers
                     where wu.UserID == strUserID || wu.UserEmail == strUserID
                    select wu).FirstOrDefault();

            string sJson = "";

            // check for duplicate userID
            if (u == null)
            {
                strPassword = Wachak.Classes.Crypto.EncryptString(strPassword);

                try
                {
                    u = new WaachakUser();
                    u.User_Name = strUserID;
                    u.UserID = strUserID;
                    u.UserPassword = strPassword;
                    u.UserEmail = strUserEmail;

                    string strToken = Wachak.Classes.Crypto.CreateToken(strUserID + strPassword);
                    u.UserToken = strToken;
                    db.WaachakUsers.Add(u);
                    db.SaveChanges();

                    var uj = new
                    {
                        User_Name = strUserName,
                        UserID = strUserID,
                        userImageUrl = @"Images/reader.jpg",
                        authToken = strToken
                    };

                    sJson = JsonConvert.SerializeObject(uj);
                }
                catch(System.Data.Entity.Validation.DbEntityValidationException ex)
                {
                    string err = ex.Message;
                }
            }
            else
            {
                var uj = new
                {
                    User_Name = "",
                    UserID = "",
                    userImageUrl = "",
                    authToken = ""
                };

                sJson = JsonConvert.SerializeObject(uj);
            }

            resp = new HttpResponseMessage()
            {
                Content = new StringContent(sJson)
            };

            return resp;
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}