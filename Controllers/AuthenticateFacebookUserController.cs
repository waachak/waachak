using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Wachak.Controllers
{
    public class AuthenticateFacebookUserController : ApiController
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
                string strUrl = @"https://graph.facebook.com/oauth/access_token?client_id=YOUR ID HERE&redirect_uri=http://waachak.apphb.com/Index.html&client_secret=YOUR CODE HERE&code=" + value;
                //string strUrl = @"https://graph.facebook.com/oauth/access_token?client_id=YOUR ID HERE&redirect_uri=http://localhost:51041/Index.html&client_secret=YOUR CODE HERE&code=" + value;


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

                string access_token = "";
                if (!string.IsNullOrEmpty(jsonResponse) && jsonResponse.Length > 13)
                    access_token = jsonResponse.Substring(13);

                // Get User Info
                if (!string.IsNullOrEmpty(access_token))
                {
                    jsonResponse = string.Empty;
                    strUrl = @"https://graph.facebook.com/debug_token?input_token=" + access_token + @"&access_token=TOKEN HERE";
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
                    string strUserID = ((dynamic)((Newtonsoft.Json.Linq.JObject)(userInfo))).data.user_id;

                    strUrl = @"https://graph.facebook.com/" + strUserID + @"?fields=id,name";
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

                    userInfo = JsonConvert.DeserializeObject(jsonResponse);
                    string strUserName = ((dynamic)((Newtonsoft.Json.Linq.JObject)(userInfo))).name;
                    string strImageUrl = @"http://graph.facebook.com/" + strUserID + @"/picture?type=square";

                    waachakDBEntities db = new waachakDBEntities();

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
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}