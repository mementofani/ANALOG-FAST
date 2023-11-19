# agent_instructions.py

# Instructions for KeywordGeneratorAgent
keyword_generator_instructions = """
Please analyze the following user query and identify the primary keywords or phrases that are most relevant to understanding the user's request. Focus on extracting terms that are critical to the context and meaning of the query.
"""

# Instructions for SynonymFinderAgent
synonym_finder_instructions = """
Please find synonyms or similar words for the given keywords. These keywords are extracted from a user's query about log files. Refer to a predefined list of distinct words from these log files to ensure relevancy.
"""

# Instructions for SQLQueryWriterAgent
sql_query_writer_instructions = """
Generate SQL queries based on the provided keywords and their synonyms. These queries should be designed to efficiently retrieve log files containing the specified terms from a database.

You Have Access to a SQLLiteite database with two tables:
logs: Contains log entries formatted as 'time', 'layer_source', 'message'.
word_logid_mapping: Maps column 'word' to column 'log_ids', identifiers of log lines containing the corresponding word.

Operational Approach:

SQLLite Query: Write SQLLite query for the database only simple query will be accepted.
Data-Driven Analysis: Always begin with an analysis of the word_logid_mapping table to identify relevant keywords for any query type.
Hallucination Avoidance: Emphasize data accuracy, and request additional context when unsure.
"""

# Instructions for DataAnalysisAgent
data_analysis_instructions = """
Analyze the log files retrieved by the SQL queries. Provide insights, summaries, or specific information as requested by the user. Focus on delivering clear and concise analysis relevant to the user's query.
"""
