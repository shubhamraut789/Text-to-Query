const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const fastcsv = require('fast-csv');
const path = require('path');
const app = express();
const PORT = 3000;

// Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Shubham',
    database: 'texttoquery'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Function to map English text to SQL queries
function mapEnglishToSQL(englishText) {
    englishText = englishText.toLowerCase(); // Normalize text
    let sqlQuery = '';

    // Select Queries
if (englishText.includes('all users')) {
    sqlQuery = "SELECT * FROM Users";
} else if (englishText.includes('all transactions')) {
    sqlQuery = "SELECT * FROM Transactions";
} else if (englishText.includes('all loans')) {
    sqlQuery = "SELECT * FROM Loans";
} else if (englishText.includes('users with their account number')) {
    sqlQuery = "SELECT user_id, name, account_number FROM Users";
} else if (englishText.includes('account number with loan type')) {
    const loanType = englishText.match(/loan type='(.+?)'/)?.[1];
    sqlQuery = "SELECT account_number, loan_type FROM Loans";
} else if (englishText.includes('user details with account number')) {
    const accountNumber = englishText.match(/account number (\w+)/)?.[1];
    sqlQuery = `SELECT * FROM Users WHERE account_number = '${accountNumber}'`;
} else if (englishText.includes('transactions on date')) {
    const date = englishText.match(/date (\d{4}-\d{2}-\d{2})/)?.[1];
    sqlQuery = `SELECT * FROM Transactions WHERE transaction_date = ${date}`;
} else if (englishText.includes('transaction details with transaction id, amount')) {
    sqlQuery = "SELECT transaction_id, transaction_amount FROM Transactions";
} else if (englishText.includes('loan details of account number')) {
    const accountNumber = englishText.match(/account number (\w+)/)?.[1];
    sqlQuery = `SELECT * FROM Loans WHERE account_number = '${accountNumber}'`;
} else if (englishText.includes('user details including name and address')) {
    sqlQuery = "SELECT name, address FROM Users";
} else if (englishText.includes('user addresses')) {
    sqlQuery = "SELECT user_id, name, address FROM Users";
} else if (englishText.includes('all transactions for account number')) {
    const accountNumber = englishText.match(/account_number (\w+)/)?.[1];
    sqlQuery = `SELECT * FROM Transactions WHERE account_number = '${accountNumber}'`;
} else if (englishText.includes('transactions with date')) {
    sqlQuery = "SELECT transaction_date FROM Transactions";
    


    
// Filter Queries
} else if (englishText.includes('transactions greater than ')) {
    const amount = englishText.match(/than (\d+)/)?.[1];
    sqlQuery = `SELECT * FROM Transactions WHERE transaction_amount > '${amount}'`;
} else if (englishText.includes('loans greater than')) {
    const amount = englishText.match(/than (\d+)/)?.[1];
    sqlQuery = `SELECT * FROM Loans WHERE loan_amount > '${amount}'`;
} else if (englishText.includes('transactions done at location')) {
    const location = englishText.match(/location (.+)$/)?.[1];
    sqlQuery = `SELECT * FROM Transactions WHERE location = '${location}'`;
} else if (englishText.includes('transactions made after')) {
    const date = englishText.match(/after (\d{4}-\d{2}-\d{2})/)?.[1];
    sqlQuery = `SELECT * FROM Transactions WHERE transaction_date > '${date}'`;
} else if (englishText.includes('loans with interest rate greater than')) {
    const interestRate = englishText.match(/interest rate greater than (\d+(\.\d+)?)/)?.[1];
    sqlQuery = `SELECT * FROM Loans WHERE interest_rate > '${interestRate}'`;
} else if (englishText.includes('loans ending in')) {
    const year = englishText.match(/ending in (\d{4})/)?.[1];
    sqlQuery = `SELECT * FROM Loans WHERE YEAR(loan_due_date) = '${year}'`;
} else if (englishText.includes('loans starting in')) {
    const year = englishText.match(/starting in (\d{4})/)?.[1];
    sqlQuery = `SELECT * FROM Loans WHERE YEAR(loan_start_date) = '${year}'`;
} else if (englishText.includes('transactions less than')) {
    const amount = englishText.match(/less than (\d+)/)?.[1];
    sqlQuery = `SELECT * FROM Transactions WHERE transaction_amount < '${amount}'`;
} else if (englishText.includes('loans less than')) {
    const amount = englishText.match(/loans less than (\d+)/)?.[1];
    sqlQuery = `SELECT * FROM Loans WHERE loan_amount < '${amount}'`;
} else if (englishText.includes('loans with interest rate less than')) {
    const interestRate = englishText.match(/interest rate less than (\d+(\.\d+)?)/)?.[1];
    sqlQuery = `SELECT * FROM Loans WHERE interest_rate < '${interestRate}'`;
} else if (englishText.includes('users with address')) {
    const address = englishText.match(/address (.+)$/)?.[1];
    sqlQuery = `SELECT * FROM Users WHERE address = ${address}`;
} else if (englishText.includes('users without an address specified')) {
    sqlQuery = "SELECT * FROM Users WHERE address IS NULL";
} else if (englishText.includes('transactions with transaction type')) {
    const type = englishText.match(/transaction_type='(.+?)'/)?.[1];
    sqlQuery = `SELECT * FROM Transactions WHERE transaction_type = ${type}`;
} else if (englishText.includes('loans due after')) {
    const dueDate = englishText.match(/due after (\d{4}-\d{2}-\d{2})/)?.[1];
    sqlQuery = `SELECT * FROM Loans WHERE loan_due_date > ${dueDate}`;
} else if (englishText.includes('users who have made a transaction in')) {
    const year = englishText.match(/in (\d{4})/)?.[1];
    sqlQuery = `
        SELECT DISTINCT Users.user_id, Users.name
        FROM Users
        JOIN Transactions ON Users.account_number = Transactions.account_number
        WHERE YEAR(Transactions.transaction_date) = ${year}`;
} else if (englishText.includes('transactions made between')) {
    const [startDate, endDate] = englishText.match(/between '(.+?)' and '(.+?)'/).slice(1);
    sqlQuery = `SELECT * FROM Transactions WHERE transaction_date BETWEEN ${startDate} AND ${endDate}`;
} else if (englishText.includes('loans where loan type')) {
    const [loanType, amount] = englishText.match(/loan_type='(.+?)' and loan_amount > (\d+)/).slice(1);
    sqlQuery = `SELECT * FROM Loans WHERE loan_type = '${loanType}' AND loan_amount > ${amount}`;
} else if (englishText.includes('users linked to account numbers starting with')) {
    const prefix = englishText.match(/starting with '(.+?)'/)?.[1];
    sqlQuery = `SELECT * FROM Users WHERE account_number LIKE ${prefix}%`;
} else if (englishText.includes('loans sorted by interest rate in descending order')) {
    sqlQuery = "SELECT * FROM Loans ORDER BY interest_rate DESC";
} else if (englishText.includes('loans sorted by interest rate in ascending order')) {
    sqlQuery = "SELECT * FROM Loans ORDER BY interest_rate ASC";
} else if (englishText.includes('transactions greater than')) {
    const amount = englishText.match(/greater than (\d+)/)?.[1];
    sqlQuery = `SELECT * FROM Transactions WHERE transaction_amount > ${amount}`;
} else if (englishText.includes('loans greater than')) {
    const amount = englishText.match(/greater than (\d+)/)?.[1];
    sqlQuery = `SELECT * FROM Loans WHERE loan_amount > ${amount}`;
} else if (englishText.includes('loans sorted by loan due date')) {
    sqlQuery = "SELECT * FROM Loans ORDER BY loan_due_date ASC";
} else if (englishText.includes('transactions grouped by transaction type')) {
    sqlQuery = "SELECT transaction_type, COUNT(*) AS transaction_count FROM Transactions GROUP BY transaction_type";
} else if (englishText.includes('loans grouped by type')) {
    sqlQuery = `
    SELECT loan_type, COUNT(*) AS count, SUM(loan_amount) AS total_amount
    FROM Loans
    GROUP BY loan_type`;





// Aggregation Queries
} else if (englishText.includes('total transactions amount for')) {
    const year = englishText.match(/for (\d{4})/)?.[1];
    sqlQuery = `SELECT SUM(transaction_amount) AS total_transaction_amount FROM Transactions WHERE YEAR(transaction_date) = '${year}'`;
} else if (englishText.includes('average loan amount for loans')) {
    sqlQuery =`SELECT AVG(loan_amount) AS avg_loan_amount FROM Loans`;
} else if (englishText.includes('maximum loan amount issued in')) {
    const year = englishText.match(/in (\d{4})/)?.[1];
    sqlQuery = `SELECT MAX(loan_amount) AS max_loan_amount FROM Loans WHERE YEAR(loan_start_date) = '${year}'`;
} else if (englishText.includes('minimum loan amount issued in')) {
    const year = englishText.match(/in (\d{4})/)?.[1];
    sqlQuery = `SELECT MIN(loan_amount) AS min_loan_amount FROM Loans WHERE YEAR(loan_start_date) = '${year}'`;
} else if (englishText.includes('total transaction amount by transaction type')) {
    sqlQuery = "SELECT transaction_type, SUM(transaction_amount) AS total_amount FROM Transactions GROUP BY transaction_type";
} else if (englishText.includes('highest transaction by transaction type')) {
    sqlQuery = "SELECT MAX(transaction_amount) AS highest_transaction,transaction_type FROM Transactions GROUP BY transaction_type";
} else if (englishText.includes('average interest rate for loans of type')) {
    const loanType = englishText.match(/type\s*['"](.+?)['"]/)?.[1];
    sqlQuery = `SELECT AVG(interest_rate) AS avg_interest_rate FROM Loans WHERE loan_type = '${loanType}'`;
} else if (englishText.includes('lowest transaction by transaction type')) {
    sqlQuery = "SELECT MIN(transaction_amount) AS lowest_transaction FROM Transactions GROUP BY transaction_type";
} else if (englishText.includes('maximum loan amount issued for every year')) {
    sqlQuery = "SELECT MAX(loan_amount) AS max_loan_amount FROM Loans GROUP BY YEAR(loan_start_date)";
} else if (englishText.includes('total number of users')) {
    sqlQuery = "SELECT COUNT(*) AS total_users FROM Users";
} else if (englishText.includes('average interest rate')) {
    sqlQuery = "SELECT AVG(interest_rate) AS avg_interest_rate FROM Loans";
} else if (englishText.includes('total interest collected')) {
    sqlQuery = `
        SELECT SUM(loan_amount * interest_rate / 100) AS total_interest_collected
        FROM Loans`;
} else if (englishText.includes('total number of transactions in')) {
    const year = englishText.match(/in (\d{4})/)?.[1];
    sqlQuery = `SELECT COUNT(*) AS total_transactions FROM Transactions WHERE YEAR(transaction_date) = '${year}'`;
} else if (englishText.includes('total number of loans grouped by loan type')) {
    sqlQuery = "SELECT loan_type, COUNT(*) AS total_loans FROM Loans GROUP BY loan_type";
} else if (englishText.includes('average transaction amount')) {
    sqlQuery = "SELECT AVG(transaction_amount) AS avg_transaction FROM Transactions";
} else if (englishText.includes('average transaction amount for ATM transactions')) {
    sqlQuery = "SELECT AVG(transaction_amount) AS avg_amount FROM Transactions WHERE transaction_type = 'ATM'";
} else if (englishText.includes('total loan amount due for')) {
    const year = englishText.match(/for (\d{4})/)?.[1];
    sqlQuery = `SELECT SUM(loan_amount) AS total_due FROM Loans WHERE YEAR(loan_due_date) = '${year}'`;
} else if (englishText.includes('count of transactions by location')) {
    sqlQuery = "SELECT location, COUNT(*) AS transaction_count FROM Transactions GROUP BY location";
}





//LIMIT Queries
 else if (englishText.includes('top') && englishText.includes('users with highest loan')) {
        
        const limitMatch = englishText.match(/top (\d+)/);
        const limit = limitMatch ? parseInt(limitMatch[1]) : 10; // Default to 10 if no LIMIT specified
    
        // SQL query for top users with the highest loan
        sqlQuery = `
            SELECT Users.user_id, Users.name, MAX(Loans.loan_amount) AS highest_loan
            FROM Users JOIN Loans 
            ON 
            Users.account_number = Loans.account_number
            GROUP BY 
                Users.user_id, Users.name
            ORDER BY 
                highest_loan DESC
            LIMIT ${limit}`;
 }else if (englishText.includes('top') && englishText.includes('users with highest transactions')) {
                // Extract the LIMIT value
                const limitMatch = englishText.match(/top (\d+)/);
                const limit = limitMatch ? parseInt(limitMatch[1]) : 10; // Default to 10 if no LIMIT specified
            
                // SQL query for top users with the highest transactions
                sqlQuery = `
                    SELECT Users.user_id, Users.name, MAX(Transactions.transaction_amount) AS highest_transaction
                    FROM Users
                    JOIN Transactions 
                    ON 
                        Users.account_number = Transactions.account_number
                    GROUP BY 
                        Users.user_id, Users.name
                    ORDER BY 
                        highest_transaction DESC
                    LIMIT ${limit}`;
 }else if (englishText.includes('top') && englishText.includes('transactions of account number')) {
                        // Extract the LIMIT value
                        const limitMatch = englishText.match(/top (\d+)/);
                        const limit = limitMatch ? parseInt(limitMatch[1]) : 10; // Default to 10 if no LIMIT is specified
                    
                        // Extract the account number
                        const accountNumberMatch = englishText.match(/number (\w+)/);
                        const accountNumber = accountNumberMatch ? accountNumberMatch[1] : null;
                    
                        // Extract the year
                        const yearMatch = englishText.match(/for (\d{4})/);
                        const year = yearMatch ? parseInt(yearMatch[1]) : null;
                    
                        // Generate SQL query
                        if (accountNumber && year) {
                            sqlQuery = `
                                SELECT Transactions.transaction_id, Transactions.account_number, Transactions.transaction_date, Transactions.transaction_amount
                                FROM Transactions
                                WHERE 
                                    Transactions.account_number = '${accountNumber}'
                                    AND YEAR(Transactions.transaction_date) = ${year}
                                ORDER BY 
                                    Transactions.transaction_amount DESC
                                LIMIT ${limit}`;
                        } 
                    


// Join Queries
} else if (englishText.includes('users with their transactions')) {
    sqlQuery = `
        SELECT Users.name, Transactions.transaction_id, Transactions.transaction_amount
        FROM Users
        JOIN Transactions ON Users.account_number = Transactions.account_number`;
} else if (englishText.includes('users along with their loan details')) {
    sqlQuery = `
        SELECT Users.name, Loans.loan_id, Loans.loan_amount
        FROM Users
        JOIN Loans ON Users.account_number = Loans.account_number`;
} else if (englishText.includes('user with highest loan')) {
    sqlQuery = `
        SELECT Users.user_id, Users.name, Loans.loan_amount
        FROM Users 
        INNER JOIN Loans ON Users.account_number = Loans.account_number
        WHERE Loans.loan_amount = (SELECT MAX(loan_amount) FROM Loans)
        ORDER BY Users.name ASC
        LIMIT 1
        `;
    } else if (englishText.includes('user with lowest loan')) {
        sqlQuery = `
            SELECT Users.user_id, Users.name, Loans.loan_amount
        FROM Users 
        INNER JOIN Loans ON Users.account_number = Loans.account_number
        WHERE Loans.loan_amount = (SELECT MIN(loan_amount) FROM Loans)
        ORDER BY Users.name ASC
        LIMIT 1`;
} else if (englishText.includes('users with their loans')) {
    sqlQuery = `
        SELECT Users.name, Loans.loan_id, Loans.loan_amount
        FROM Users
        JOIN Loans ON Users.account_number = Loans.account_number`;
} else if (englishText.includes('loans with associated transactions')) {
    sqlQuery = `
        SELECT Loans.loan_id, Transactions.transaction_id, Transactions.transaction_amount
        FROM Loans
        JOIN Transactions ON Loans.account_number = Transactions.account_number`;
} else if (englishText.includes('transactions with user details')) {
    sqlQuery = `
        SELECT Transactions.transaction_id, Users.name, Transactions.transaction_amount
        FROM Transactions
        JOIN Users ON Transactions.account_number = Users.account_number`;
} else if (englishText.includes('users with no transactions')) {
        sqlQuery = `
            SELECT Users.user_id, Users.name ,Transactions.transaction_amount
            FROM Users 
            LEFT JOIN Transactions ON Users.account_number = Transactions.account_number 
            WHERE Transactions.transaction_id IS NULL`;
} else if (englishText.includes('users with transactions above')) {
            const amount = englishText.match(/above (\d+)/)?.[1];
            sqlQuery = `
                SELECT DISTINCT Users.user_id, Users.name ,Transactions.transaction_amount
                FROM Users 
                JOIN Transactions ON Users.account_number = Transactions.account_number 
                WHERE Transactions.transaction_amount > '${amount}'`;
   
    // Catch-all for unmapped queries
    } else {
        throw new Error('Please rephrase your query according to suggestion box.');
    }

    return sqlQuery;
}





// Route to handle text-to-query mapping and execute SQL
app.post('/query', (req, res) => {
    const englishText = req.body.query;

    if (!englishText) {
        return res.status(400).json({ error: 'No query provided' });
    }

    let sqlQuery;
    try {
        sqlQuery = mapEnglishToSQL(englishText);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return res.status(500).json({ error: 'Error executing query' });
        }

        const filePath = path.join(__dirname, 'public', 'results.csv');
        const ws = fs.createWriteStream(filePath);

        fastcsv
            .write(results, { headers: true })
            .pipe(ws)
            .on('finish', () => {
                res.json({ downloadLink: '/results.csv' });
            });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
