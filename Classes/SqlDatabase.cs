using System;
using System.Collections.Generic;
using System.Text;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;

namespace DAL
{
    /// <summary>
    /// Author: Pushkar Chivate (PNC4)
    /// Description: SqlDataBase Class 
    /// Details: Class used to perform database functions against Sql Server database
    /// </summary>
    class SqlDataBase : IDisposable
    {
        #region Properties /Misc functions

        public bool IsInTransaction { get; set; }
         string ConnectionString { get; set; }
        
        private SqlCommand m_DatabaseCommand = null;
        private SqlCommand DatabaseCommand
        {
            get
            {
                if (m_DatabaseCommand == null)
                    m_DatabaseCommand = new SqlCommand();

                return m_DatabaseCommand;
            }
            set
            {
                m_DatabaseCommand = value;
            }
        }

        public SqlTransaction DatabaseTransaction { get; set; }
        //private string ConnectionString { get; set; }

        private SqlConnection m_DatabaseConnection = null;
        private SqlConnection DatabaseConnection
        {
            get
            {
                ConnectionString = System.Configuration.ConfigurationManager.AppSettings["waachakDatabase"].ToString();

                ConnectionString = System.Configuration.ConfigurationManager.AppSettings["waachakDBEntities"].ToString();
                if (m_DatabaseConnection == null)
                    m_DatabaseConnection = new SqlConnection(ConnectionString);

                return m_DatabaseConnection;
            }
            set { m_DatabaseConnection = value; }
        }

        public  void CloseDBConnection()
        {
            if (this.DatabaseConnection != null)
            {
                if (this.DatabaseConnection.State != ConnectionState.Closed)
                    this.DatabaseConnection.Close();

                //this.DatabaseConnection.Dispose();
            }
        }

        #region Database Transaction functions
        public  bool BeginTransaction()
        {
            return BeginTransaction("");
        }

        public  bool BeginTransaction(string strTransactionName)
        {
            IsInTransaction = true;
            DatabaseTransaction = DatabaseConnection.BeginTransaction(strTransactionName);
            DatabaseCommand.Transaction = DatabaseTransaction;

            return true;
        }

        public  void RollBack()
        {
            RollBack("");
        }
        public  void RollBack(string strTransactionName)
        {
            IsInTransaction = false;
            DatabaseTransaction.Rollback(strTransactionName);
        }

        public  void Commit()
        {
            IsInTransaction = false;
            DatabaseTransaction.Commit();
        }

        #endregion Database Transaction functions

        public  void CreateStoredProcCommand(string strStoredProcName, int intCommandTimeOut)
        {
            if (DatabaseCommand == null)
                DatabaseCommand = new SqlCommand();

            DatabaseCommand.CommandText = strStoredProcName;
            DatabaseCommand.Connection = DatabaseConnection;
            DatabaseCommand.CommandType = CommandType.StoredProcedure;
            DatabaseCommand.CommandTimeout = intCommandTimeOut;
        }

        public  void CreateStoredProcCommand(string strStoredProcName)
        {
            CreateStoredProcCommand(strStoredProcName, 30);
        }

        private bool ValidateCommand()
        {
            if (DatabaseCommand == null || DatabaseCommand.CommandText == null)
                return false;

            if (DatabaseConnection.State != ConnectionState.Open)
                DatabaseConnection.Open();

            DatabaseCommand.Connection = DatabaseConnection;
            return true;
        }
        #endregion

        #region Constructor
        public SqlDataBase()
        { }
        public SqlDataBase(string strConnString)
        {
            ConnectionString = strConnString;
        }
        #endregion

        #region Database Functions
        public  int ExecuteNonQuery()
        {
            int intRet = 0;
            if (!ValidateCommand())
                return intRet;

            intRet = DatabaseCommand.ExecuteNonQuery();

            if (!IsInTransaction)
                CloseDBConnection();

            return intRet;
        }

        public SqlDataReader ExecuteReader()
        {
            SqlDataReader sdr = null;
            if (!ValidateCommand())
                return sdr;

            sdr = DatabaseCommand.ExecuteReader();

            if (!IsInTransaction)
                CloseDBConnection();

            return sdr;
        }

        public  object ExecuteScalar()
        {
            object obj = null;
            if (!ValidateCommand())
                return obj;

            obj = DatabaseCommand.ExecuteScalar();

            if (!IsInTransaction)
                CloseDBConnection();

            return obj;
        }

        public  DataSet LoadDataSet()
        {
            DataSet ds = new DataSet();
            if (!ValidateCommand())
                return ds;

            SqlDataAdapter da = new SqlDataAdapter(DatabaseCommand);
            da.Fill(ds);

            if (!IsInTransaction)
                CloseDBConnection();

            return ds;
        }

        public  DataTable LoadDataTable()
        {
            DataTable dt = new DataTable();
            if (!ValidateCommand())
                return dt;

            SqlDataAdapter da = new SqlDataAdapter(DatabaseCommand);
            da.Fill(dt);

            if (!IsInTransaction)
                CloseDBConnection();

            return dt;
        }

        public  DataTable[] LoadDataTablesForPaging(int intStartRecord, int intMaxRecord)
        {
            DataTable[] dts = null;
            if (!ValidateCommand())
                return dts;

            SqlDataAdapter da = new SqlDataAdapter(DatabaseCommand);
            da.Fill(intStartRecord, intMaxRecord, dts);

            if (!IsInTransaction)
                CloseDBConnection();

            return dts;
        }

        #region Command Parameter Functions
        public  void AddInCommandParameter(string strParameterName, object sqlParmeterValue)
        {
            DatabaseCommand.Parameters.AddWithValue(strParameterName, sqlParmeterValue);
        }

        public  void AddOutCommandParameter(string strParameterName, SqlDbType sqlParmeterDbType)
        {
            SqlParameter parm = new SqlParameter(strParameterName, sqlParmeterDbType);
            parm.Direction = ParameterDirection.Output;
            DatabaseCommand.Parameters.Add(parm);
        }

        public  void AddInOutCommandParameter(string strParameterName, SqlDbType sqlParmeterDbType, object sqlParmeterValue)
        {
            SqlParameter parm = new SqlParameter(strParameterName, sqlParmeterDbType);
            parm.Value = sqlParmeterValue;
            parm.Direction = ParameterDirection.InputOutput;
            DatabaseCommand.Parameters.Add(parm);
        }

        public  void AddReturnValueCommandParameter(string strParameterName, SqlDbType sqlParmeterDbType)
        {
            SqlParameter parm = new SqlParameter(strParameterName, sqlParmeterDbType);
            parm.Direction = ParameterDirection.ReturnValue;
            DatabaseCommand.Parameters.Add(parm);
        }

        public  void ClearCommandParameters()
        {
            if (DatabaseCommand != null && DatabaseCommand.Parameters != null && DatabaseCommand.Parameters.Count > 0)
                DatabaseCommand.Parameters.Clear();
        }

        public  object GetOutParameterValue(string strParameterName)
        {
            if (DatabaseCommand != null && DatabaseCommand.Parameters != null && DatabaseCommand.Parameters.Count > 0 && DatabaseCommand.Parameters[strParameterName] != null)
                return DatabaseCommand.Parameters[strParameterName].Value;

            return null;
        }
        #endregion

        #endregion

        #region IDisposable Members
        public void Dispose()
        {
            CloseDBConnection();
            DatabaseCommand.Dispose();
        }
        #endregion
    }
}
