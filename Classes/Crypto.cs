using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Security.Cryptography;
using System.IO;
using System.Text;

namespace Wachak.Classes
{
    public static class Crypto
    {
        internal static string EncryptString(string strValue)
        {
            string strEncryptedString = "";
            if (string.IsNullOrEmpty(strValue))
                return "";
            
            using (System.Security.Cryptography.SHA1 hash = System.Security.Cryptography.SHA1.Create())
            {
                System.Text.ASCIIEncoding encoder = new System.Text.ASCIIEncoding();
                byte[] combined = encoder.GetBytes(strValue);
                strEncryptedString = Convert.ToBase64String(hash.ComputeHash(combined));
            }
                        
            return strEncryptedString;
        }

        internal static string CreateToken(string strValue)
        {
            string strEncryptedString = "";
            if (string.IsNullOrEmpty(strValue))
                return "";
         
            string sharedSecret = "YOUR KEY HERE";
            byte[] _salt = Encoding.ASCII.GetBytes("YOUR SALT HERE");

            RijndaelManaged aesAlg = null;              // RijndaelManaged object used to encrypt the data.

            try
            {
                // generate the key from the shared secret and the salt
                Rfc2898DeriveBytes key = new Rfc2898DeriveBytes(sharedSecret, _salt);

                // Create a RijndaelManaged object
                aesAlg = new RijndaelManaged();
                aesAlg.Key = key.GetBytes(aesAlg.KeySize / 8);

                // Create a decryptor to perform the stream transform.
                ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

                // Create the streams used for encryption.
                using (MemoryStream msEncrypt = new MemoryStream())
                {
                    // prepend the IV
                    msEncrypt.Write(BitConverter.GetBytes(aesAlg.IV.Length), 0, sizeof(int));
                    msEncrypt.Write(aesAlg.IV, 0, aesAlg.IV.Length);
                    using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                    {
                        using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                        {
                            //Write all data to the stream.
                            swEncrypt.Write(strValue);
                        }
                    }
                    strEncryptedString = Convert.ToBase64String(msEncrypt.ToArray());
                }
            }
            finally
            {
                // Clear the RijndaelManaged object.
                if (aesAlg != null)
                    aesAlg.Clear();
            }

            return strEncryptedString;
        }

        internal static bool IsLoggedInUser(string strUserID, string strToken)
        {
            bool blnRet = false;

            if (string.IsNullOrEmpty(strUserID))
                return blnRet;

            if (strUserID == "Explorer" && string.IsNullOrEmpty(strToken))
                return true;

            if (string.IsNullOrEmpty(strToken))
                return blnRet;

            waachakDBEntities db = new waachakDBEntities();
            var user = from wu in db.WaachakUsers
                       where wu.UserID == strUserID && wu.UserToken == strToken
                       select wu;

            blnRet = (user != null && user.Any());
                 
            return blnRet;
        }
    }
}