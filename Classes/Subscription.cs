using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wachak.Classes
{
    public class Subscription
    {
        public int ID { get; set; }
        public string authToken { get; set; }
        public string name { get; set; }
        public string url { get; set; }
        public int unreadCount { get; set; }
        public int IsFolder { get; set; }
        public int ParentFolder { get; set; }
        public string userID { get; set; }
        public int savedForReading { get; set; }
        public string feedName { get; set; }
        public string ShowAll { get; set; }
        public int GetAllFeeds { get; set; }

        public List<FeedItem> items{ get; set; }
        //public Subscription()
        //{ }
        //public Subscription(string _name, string _url)
        //{ 
        //    this.name = _name;
        //    this.url = _url;
        //}
    }
}