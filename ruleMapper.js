
function ruleBasedMapper(englishText) {
    englishText = englishText.toLowerCase(); // Normalize text
    let sqlQuery = '';

    // SELECT Queries
    if (englishText.includes('all users')) {
        sqlQuery = "SELECT * FROM Users";
    } else if (englishText.includes('all transactions')) {
        sqlQuery = "SELECT * FROM Transactions";
    } else if (englishText.includes('all loans')) {
        sqlQuery = "SELECT * FROM Loans";
    } else if (englishText.includes('users with their account number')) {
        sqlQuery = "SELECT user_id, name, account_number FROM Users";
    } else if (englishText.includes('account number with loan type')) {
        sqlQuery = "SELECT account_number, loan_type FROM Loans";
    } else if (englishText.includes('user details with account number')) {
        const accountNumber = englishText.match(/account number (\w+)/)?.[1];
        sqlQuery = `SELECT * FROM Users WHERE account_number = '${accountNumber}'`;
    } else if (englishText.includes('transactions on date')) {
        const date = englishText.match(/date (\d{4}-\d{2}-\d{2})/)?.[1];
        sqlQuery = `SELECT * FROM Transactions WHERE transaction_date = '${date}'`;
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

    // FILTER Queries
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
    } else if (englishText.includes('users without an address specified')) {
        sqlQuery = "SELECT * FROM Users WHERE address IS NULL";
    } else if (englishText.includes('transactions with transaction type')) {
        const type = englishText.match(/transaction_type='(.+?)'/)?.[1];
        sqlQuery = `SELECT * FROM Transactions WHERE transaction_type = '${type}'`;
    } else if (englishText.includes('loans due after')) {
        const dueDate = englishText.match(/due after (\d{4}-\d{2}-\d{2})/)?.[1];
        sqlQuery = `SELECT * FROM Loans WHERE loan_due_date > '${dueDate}'`;
    } else if (englishText.includes('transactions made between')) {
        const [startDate, endDate] = englishText.match(/between '(.+?)' and '(.+?)'/).slice(1);
        sqlQuery = `SELECT * FROM Transactions WHERE transaction_date BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // AGGREGATION Queries
    else if (englishText.includes('total transactions amount for')) {
        const year = englishText.match(/for (\d{4})/)?.[1];
        sqlQuery = `SELECT SUM(transaction_amount) AS total_transaction_amount FROM Transactions WHERE YEAR(transaction_date) = '${year}'`;
    } else if (englishText.includes('average loan amount for loans')) {
        sqlQuery = `SELECT AVG(loan_amount) AS avg_loan_amount FROM Loans`;
    } else if (englishText.includes('maximum loan amount issued in')) {
        const year = englishText.match(/in (\d{4})/)?.[1];
        sqlQuery = `SELECT MAX(loan_amount) AS max_loan_amount FROM Loans WHERE YEAR(loan_start_date) = '${year}'`;
    } else if (englishText.includes('minimum loan amount issued in')) {
        const year = englishText.match(/in (\d{4})/)?.[1];
        sqlQuery = `SELECT MIN(loan_amount) AS min_loan_amount FROM Loans WHERE YEAR(loan_start_date) = '${year}'`;
    } else if (englishText.includes('total transaction amount by transaction type')) {
        sqlQuery = "SELECT transaction_type, SUM(transaction_amount) AS total_amount FROM Transactions GROUP BY transaction_type";
    } else if (englishText.includes('highest transaction by transaction type')) {
        sqlQuery = "SELECT MAX(transaction_amount) AS highest_transaction, transaction_type FROM Transactions GROUP BY transaction_type";
    }

    // LIMIT Queries
    else if (englishText.includes('top') && englishText.includes('users with highest loan')) {
        const limit = englishText.match(/top (\d+)/)?.[1] || 10;
        sqlQuery = `
            SELECT Users.user_id, Users.name, MAX(Loans.loan_amount) AS highest_loan
            FROM Users
            JOIN Loans ON Users.account_number = Loans.account_number
            GROUP BY Users.user_id, Users.name
            ORDER BY highest_loan DESC
            LIMIT ${limit}`;
    }

    // JOIN Queries
    else if (englishText.includes('users with their transactions')) {
        sqlQuery = `
            SELECT Users.name, Transactions.transaction_id, Transactions.transaction_amount
            FROM Users
            JOIN Transactions ON Users.account_number = Transactions.account_number`;
    } else if (englishText.includes('users along with their loan details')) {
        sqlQuery = `
            SELECT Users.name, Loans.loan_id, Loans.loan_amount
            FROM Users
            JOIN Loans ON Users.account_number = Loans.account_number`;
    }

    // Fallback if nothing matches
    else {
        throw new Error("No rule-based match found");
    }

    return sqlQuery;
}

module.exports = { ruleBasedMapper };
