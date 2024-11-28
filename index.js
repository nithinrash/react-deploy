const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Parse incoming JSON data
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Utility function to map non-standard keys to database schema
const mapKeysToDatabaseSchema = (data) => {
  return data.map((row) => ({
    Date: row.Date,
    Lead_Gen_Team: row['Lead Gen Team'],
    BDM_NAME: row['BDM NAME'],
    COMPANY_NAME: row['COMPANY NAME'],
    CUSTOMER_NAME: row['CUSTOMER NAME'],
    DESIGNATION: row.DESIGNATION,
    PHONE_NO: row['PHONE NO'],
    EMAIL_ADDRESS: row['EMAIL ADDRESS'],
    COMMENTS: row.COMMENTS,
    Date_and_Time: row['Date and Time'],
    BDM_REMARKS_AFTER_MEET: row['BDM REMARKS AFTER MEET'],
    Follow_Up: row['Follow Up'],
    Feedback: row.Feedback,
    Quotation_Value: row['Quotation Value'],
    Received_Lost: row['Received / Lost'],
    Comment: row['Comment'], // Placeholder if no key is available in the input data
    Status: row['Status'], // Placeholder for any missing keys
    AssignedTo: row['AssignedTo'], // Add additional fields as needed
  }));
};

// POST endpoint to insert data into 'leads' table
app.post('/api/leads', (req, res) => {
  const leads = Array.isArray(req.body) ? req.body : [req.body];

  // Transform keys to match the database schema
  const transformedLeads = mapKeysToDatabaseSchema(leads);

  // Insert each lead into the database
  transformedLeads.forEach((lead) => {
    const query = `
      INSERT INTO leads (Date, Lead_Gen_Team, BDM_NAME, COMPANY_NAME, CUSTOMER_NAME, DESIGNATION, PHONE_NO, EMAIL_ADDRESS, COMMENTS, Date_and_Time, BDM_REMARKS_AFTER_MEET, Follow_Up, Feedback, Quotation_Value, Received_Lost, Comment, Status, AssignedTo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      lead.Date,
      lead.Lead_Gen_Team,
      lead.BDM_NAME,
      lead.COMPANY_NAME,
      lead.CUSTOMER_NAME,
      lead.DESIGNATION,
      lead.PHONE_NO,
      lead.EMAIL_ADDRESS,
      lead.COMMENTS,
      lead.Date_and_Time,
      lead.BDM_REMARKS_AFTER_MEET,
      lead.Follow_Up,
      lead.Feedback,
      lead.Quotation_Value,
      lead.Received_Lost,
      lead.Comment,
      lead.Status,
      lead.AssignedTo,
    ];

    pool.query(query, values, (error, results) => {
      if (error) {
        console.error('Error inserting data:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log('Data inserted successfully:', results.insertId);
    });
  });

  res.json({ message: 'Data processed successfully' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
