using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Net.Mail;

namespace Wachak.Controllers
{
    public class ResetPasswordController : ApiController
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
        public HttpResponseMessage Post(Wachak.Classes.WaachakUser user)
        {
            if (user == null)
                return null;

            if (user.password != user.repeatPassword)
                return null;

            waachakDBEntities db = new waachakDBEntities();

            var u = (from wu in db.WaachakUsers
                     where wu.UserEmail == user.userEmail && wu.UserPassword == user.origPassword
                     select wu).FirstOrDefault();

            if (u != null)
            {
                u.UserPassword = user.password;
                db.SaveChanges();
            }

            string sresp = "SCS";
            var resp = new HttpResponseMessage()
            {
                Content = new StringContent(sresp)
            };

            return resp;
        }

        // PUT api/<controller>/5
        public HttpResponseMessage Put(int id, [FromBody]string value)
        {
            if (string.IsNullOrEmpty(value))
                return null;

            string sresp = "";
            waachakDBEntities db = new waachakDBEntities();

            var u = (from wu in db.WaachakUsers
                     where wu.UserEmail == value
                     select wu).FirstOrDefault();

            if (u != null)
            {
                string strEncrypted = Wachak.Classes.Crypto.EncryptString(value + DateTime.Now.ToShortDateString());

                u.UserPassword = strEncrypted;
                db.SaveChanges();

                string strUrl = "";
                strUrl = "http://waachak.apphb.com/ResetPassword.html?resetPassword=" + strEncrypted + "&email=" + value;

                MailMessage msg = new MailMessage(@"rss.waachak.@gmail.com", value);
                msg.Subject = "Waachak - reset password";
                msg.IsBodyHtml = true;
                msg.Body = "Your password has been reset. Please click this link to login to waachak." + System.Environment.NewLine + strUrl;
                System.Net.Mail.SmtpClient smtp = new System.Net.Mail.SmtpClient();
                smtp.Send(msg);

                sresp = value;
            }

            var resp = new HttpResponseMessage()
            {
                Content = new StringContent(sresp)
            };

            return resp;
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}