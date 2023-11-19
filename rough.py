from Log_CURD import DatabaseQueries


print(DatabaseQueries.query("SELECT time, layer_source, message FROM logs"))