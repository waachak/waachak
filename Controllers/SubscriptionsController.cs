using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using Wachak.Classes;
using System.Data;
using Newtonsoft.Json;
using System.Web.Http.ModelBinding;
using Wachak.Controllers;

namespace Wachak
{
    public class SubscriptionsController : ApiController
    {
        // GET api/<controller>
        public string Get()
        {
            return "";
        }

        // GET api/<controller>/5
        public string Get(int id)
        {
           return "";
        }

        // POST api/<controller>
        public void Post(Wachak.Classes.Subscription sub)
        {
            if (sub == null)
                return;

            if (!Wachak.Classes.Crypto.IsLoggedInUser(sub.userID, sub.authToken))
                return;

            Uri uriResult;
            bool result = Uri.TryCreate(sub.url, UriKind.Absolute, out uriResult) && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
            if (!result)
                return;

            Wachak.Subscription sn = new Subscription();

            sn.UserID = sub.userID;
            sn.Url = sub.url;
            sn.Name = sub.name;
            int intval;
            Int32.TryParse(sub.IsFolder.ToString(), out intval);
            sn.IsFolder = intval;
            intval = 0;
            Int32.TryParse(sub.ParentFolder.ToString(), out intval);
            sn.ParentFolder = intval;

            int intId = 0;
            Int32.TryParse(sub.ID.ToString(), out intId);

            waachakDBEntities db = new waachakDBEntities();

            if (intId <= 0)
            {
                db.Subscriptions.Add(sn);
            }
            else
            {
                var s = (from subEdit in db.Subscriptions
                         where subEdit.Id == intId && subEdit.UserID == sn.UserID
                         select subEdit).First();
                s.Name = sn.Name;
                s.Url = sn.Url;
            }

            try
            {
                db.SaveChanges();
            }
            catch (System.Data.Entity.Validation.DbEntityValidationException ex)
            {
                string err = ex.Message;
            }
        }

        // PUT api/<controller>/5
        public void Put(List<Wachak.Classes.Subscription> subL)
        {
            if (subL == null)
                return;

            bool blnUserAuthenticated = false;
            int intSortValue = 0;
            waachakDBEntities db = new waachakDBEntities();

            foreach (Wachak.Classes.Subscription sub in subL)
            {
                // Validate User
                if (!blnUserAuthenticated)
                {
                    if (!Wachak.Classes.Crypto.IsLoggedInUser(sub.userID, sub.authToken))
                        return;
                    else
                        blnUserAuthenticated = true;
                }   

                var s = (from subUpdate in db.Subscriptions
                         where subUpdate.Id == sub.ID && subUpdate.UserID == sub.userID
                         select subUpdate).FirstOrDefault();

                if (s != null)
                {
                    s.SortNumber = ++intSortValue;
                    db.SaveChanges();
                }
            }
        }

        // DELETE api/<controller>/5
        public void Delete(Wachak.Classes.Subscription sub)
        {
            if (sub == null)
                return;

            // Validate User
            if (!Wachak.Classes.Crypto.IsLoggedInUser(sub.userID, sub.authToken))
                return;

            if (string.IsNullOrEmpty(sub.userID) || sub.ID <= 0)
                return;

            waachakDBEntities db = new waachakDBEntities();

            var s = (from subDelete in db.Subscriptions
                     where subDelete.Id == sub.ID && subDelete.UserID == sub.userID
                     select subDelete).FirstOrDefault();

            if (s != null)
            {
                db.Subscriptions.Remove(s);
                db.SaveChanges();
            }
        }
    }
}