using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Wachak.Classes
{
    public class WaachakUser
    {
        public int ID { get; set; }
        public string authToken { get; set; }
        public string waachakToken { get; set; }
        public string Name { get; set; }
        public string userID { get; set; }
        public string password { get; set; }
        public string repeatPassword { get; set; }
        public string origPassword { get; set; }

        public string userEmail { get; set; }
    }
}