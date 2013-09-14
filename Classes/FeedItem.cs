using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wachak.Classes
{
    public class FeedItem
    {
        public int ID { get; set; }
        public string guid { get; set; }
        public string link { get; set; }
        public string title { get; set; }
        public string pubDate { get; set; }
        public int savedItem { get; set; }
        public string feedName { get; set; }
        public string description { get; set; }
        public int unreadCount { get; set; }
        public int isItemRead { get; set; }
    }
}