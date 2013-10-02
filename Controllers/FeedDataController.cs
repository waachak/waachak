using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.ServiceModel.Syndication;
using System.Text;
using System.Web.Http;
using System.Xml;
using Wachak.Classes;
using System.Xml.Linq;

namespace Wachak.Controllers
{
    public class FeedDataController : ApiController
    {
        // GET api/<controller>
        public string Get()
        {
            return "";
        }

        // GET api/<controller>/5
        public string Get(string FeedUrl)
        {
            return "value";
        }

        // GET api/<controller>/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/<controller>
        public HttpResponseMessage Post(Wachak.Classes.Subscription sub)
        {
            List<Wachak.Classes.FeedItem> feedL = new List<Classes.FeedItem>();
            string sJson = "";
            XDocument doc = null;
            string strAtomTitle = "";

            // Get feed items
            bool bContinue = true;

            if (sub == null)
            {
                Wachak.Classes.FeedItem f = new Classes.FeedItem();
                f.feedName = "Empty request";
                f.title = "Sub is NULL";
                f.link = "";
                f.description = "";
                f.pubDate = "";
                f.guid = "";
                f.unreadCount = 0;
                f.isItemRead = 1;
                f.savedItem = 0;
                feedL.Add(f);

                sJson = JsonConvert.SerializeObject(feedL);

                bContinue = false;
            }

            // Valdidate user
            if (!Wachak.Classes.Crypto.IsLoggedInUser(sub.userID, sub.authToken))
            {
                Wachak.Classes.FeedItem f = new Classes.FeedItem();
                f.feedName = "";
                f.title = "Couldn't validate user. " + sub.userID + " Your Authorization token may have expired, please refresh the browser";
                f.link = "";
                f.description = "";
                f.pubDate = "";
                f.guid = "";
                f.unreadCount = 0;
                f.isItemRead = 1;
                f.savedItem = 0;
                feedL.Add(f);

                sJson = JsonConvert.SerializeObject(feedL);

                bContinue = false;
            }

            if (sub.userID == "Explorer" && string.IsNullOrEmpty(sub.authToken))
                sub.GetAllFeeds = 0;
            
            if (bContinue)
            {
                try
                {
                    waachakDBEntities db = new waachakDBEntities();

                    if (sub.GetAllFeeds == 1)
                    {
                        List<Wachak.Subscription> vFeedUrls = (from fu in db.Subscriptions
                                                               where fu.UserID == sub.userID
                                                               orderby fu.SortNumber
                                                               select fu).ToList();

                        foreach (Wachak.Subscription feedUrl in vFeedUrls)
                        {
                            doc = XDocument.Load(feedUrl.Url);
                            var vRet = (from item in doc.Descendants("item")
                                        select new
                                        {
                                            title = item.Element("title").Value,
                                            link = item.Element("link").Value,
                                            description = (item.Element("description") != null) ? item.Element("description").Value : "",
                                            pubDate = item.Element("pubDate").Value,
                                            guid = item.Element("link").Value,
                                            unreadCount = 0
                                        }).ToList();

                            if (vRet != null && vRet.Count == 0)
                            {
                                XNamespace n = @"http://www.w3.org/2005/Atom";
                                XElement xe = XElement.Load(feedUrl.Url);
                                strAtomTitle = xe.Element(n + "title").Value;

                                vRet = (from item in xe.Elements(n + "entry")
                                        select new
                                        {
                                            title = item.Element(n + "title").Value,
                                            link = item.Element(n + "link").Attribute("href").Value,
                                            description = (item.Element(n + "summary") != null) ? item.Element(n + "summary").Value : "",
                                            pubDate = item.Element(n + "updated").Value,
                                            guid = item.Element(n + "link").Attribute("href").Value,
                                            unreadCount = 0
                                        }).ToList();
                            }

                            foreach (var i in vRet)
                            {
                                Wachak.Classes.FeedItem f = new Classes.FeedItem();
                                f.feedName = feedUrl.Name;
                                f.title = i.title;
                                f.link = i.link;
                                f.description = i.description;
                                f.pubDate = i.pubDate;
                                f.guid = i.guid;
                                f.unreadCount = i.unreadCount;
                                f.isItemRead = 0;
                                f.savedItem = 0;
                                feedL.Add(f);
                            }
                        }
                    }
                    else
                    {
                        doc = XDocument.Load(sub.url);
                        var vRet = (from item in doc.Descendants("item")
                                    select new
                                    {
                                        title = item.Element("title").Value,
                                        link = item.Element("link").Value,
                                        description = (item.Element("description") != null) ? item.Element("description").Value : "",
                                        pubDate = item.Element("pubDate").Value,
                                        guid = item.Element("link").Value,
                                        unreadCount = 0
                                    }).ToList();

                        if (vRet != null)
                        {
                            if (vRet.Count == 0)
                            {
                                XNamespace n = @"http://www.w3.org/2005/Atom";
                                XElement xe = XElement.Load(sub.url);
                                strAtomTitle = xe.Element(n + "title").Value;

                                vRet = (from item in xe.Elements(n + "entry")
                                        select new
                                        {
                                            title = item.Element(n + "title").Value,
                                            link = item.Element(n + "link").Attribute("href").Value,
                                            description = (item.Element(n + "summary") != null) ? item.Element(n + "summary").Value : "",
                                            pubDate = item.Element(n + "updated").Value,
                                            guid = item.Element(n + "link").Attribute("href").Value,
                                            unreadCount = 0
                                        }).ToList();
                            }
                                
                            foreach (var i in vRet)
                            {
                                Wachak.Classes.FeedItem f = new Classes.FeedItem();
                                f.feedName = "";
                                f.title = i.title;
                                f.link = i.link;
                                f.description = i.description;
                                f.pubDate = i.pubDate;
                                f.guid = i.guid;
                                f.unreadCount = i.unreadCount;
                                f.isItemRead = 0;
                                f.savedItem = 0;
                                feedL.Add(f);
                            }                            
                        }
                    }

                    if (sub.userID != "Explorer" && !string.IsNullOrEmpty(sub.authToken))
                    {
                        var vDB = from fi in db.FeedItems
                                  where fi.userID == sub.userID
                                  select fi.guid;

                        var rejectList = feedL.Where(i => vDB.Contains(i.guid));
                        if (sub.ShowAll == "1" || sub.ShowAll == "All")
                        {
                            var vFinal = feedL.Except(rejectList);
                            feedL = new List<Classes.FeedItem>();
                            foreach (var i in vFinal)
                            {
                                Wachak.Classes.FeedItem f = new Classes.FeedItem();
                                f.feedName = i.feedName;
                                f.title = i.title;
                                f.link = i.link;
                                f.description = i.description;
                                f.pubDate = i.pubDate;
                                f.guid = i.guid;
                                f.unreadCount = i.unreadCount;
                                f.isItemRead = 0;
                                f.savedItem = 0;
                                feedL.Add(f);
                            }

                            foreach (var i in rejectList)
                            {
                                Wachak.Classes.FeedItem f = new Classes.FeedItem();
                                f.feedName = i.feedName;
                                f.title = i.title;
                                f.link = i.link;
                                f.description = i.description;
                                f.pubDate = i.pubDate;
                                f.guid = i.guid;
                                f.unreadCount = i.unreadCount;
                                f.isItemRead = 1;
                                f.savedItem = 0;
                                feedL.Add(f);
                            }

                            sJson = JsonConvert.SerializeObject(feedL);
                        }
                        else
                        {
                            var vFinal = feedL.Except(rejectList);
                            sJson = JsonConvert.SerializeObject(vFinal);
                        }
                    }
                    else
                    {
                        sJson = JsonConvert.SerializeObject(feedL);
                    }
                }
                catch (Exception ex)
                {
                    Wachak.Classes.FeedItem f = new Classes.FeedItem();
                    f.feedName = "";
                    f.title = "Error opening feed";
                    f.link = "";
                    f.description = ex.Message;
                    f.pubDate = "";
                    f.guid = "";
                    f.unreadCount = 0;
                    f.isItemRead = 1;
                    f.savedItem = 0;
                    sJson = JsonConvert.SerializeObject(f);
                }
            }

            string sJsonChannel = @"""Error""";
            if (doc != null)
            {
                if (strAtomTitle == "")
                {
                    var channel = from item in doc.Descendants("channel")
                              select new
                              {
                                  title = (sub.GetAllFeeds == 1) ? "All Items" : item.Element("title").Value,
                                  link = (sub.GetAllFeeds == 1) ? "" : item.Element("link").Value
                              };

                    sJsonChannel = JsonConvert.SerializeObject(channel);
                }
                else {
                                        
                    var channel = new[] {
                                            new { title = strAtomTitle, link = sub.url}
                                        };
                    sJsonChannel = JsonConvert.SerializeObject(channel);
                }                
            }
           
            sJson = @"{""channel"":" + sJsonChannel + @",""items"":" + sJson + @"}";

            var resp = new HttpResponseMessage()
             {
                 Content = new StringContent(sJson)
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