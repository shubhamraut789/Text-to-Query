# Text-to-Query

Developed a Text2Query Results Generator system for a large banking corporation, enabling non-technical users to obtain SQL query results in response to plain English queries. Designed an intuitive chat-based GUI and an automated SQL generator in JavaScript, connected to a relational database for real-time data retrieval. Delivered results in downloadable CSV/Excel formats, reducing dependency on data analysts and expediting stakeholder access to data insights. Implemented a meta-model update interface to ensure accurate query conversions based on database schema changes.

text-to-query/
├── public/                       # Frontend assets
│   ├── index.html               # Main UI
│   ├── style.css                # Styling
│   ├── script.js                # JS logic (UI + API calls)
│   └── results.csv              # Generated CSV (dynamic)
│
├── utils/                       # Backend helper modules
│   ├── ruleMapper.js           # Rule-based text-to-SQL mappings
│   └── aiMapper.js             # Cohere AI fallback logic
│
├── .env                         # API keys (e.g., COHERE_API_KEY)
├── server.js                    # Express.js backend entry point
├── package.json                 # Project metadata + dependencies
├── README.md                    # Project description + usage


![Preview](demo.png)
