import type { Client, InValue, ResultSet } from "@libsql/client";

// The small SQL interface used by the application, independent of the host.
export type QueryResult = {
  results: Record<string, any>[];
  success: boolean;
  meta: { changes: number };
};
export interface Statement {
  bind(...args: InValue[]): Statement;
  first(): Promise<Record<string, any> | null>;
  all(): Promise<QueryResult>;
  run(): Promise<QueryResult>;
}
export interface Database {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<QueryResult[]>;
}

function result(value: ResultSet): QueryResult {
  return {
    results: value.rows.map((row) =>
      Object.fromEntries(value.columns.map((column) => [column, row[column]])),
    ),
    success: true,
    meta: { changes: value.rowsAffected },
  };
}

class PreparedStatement implements Statement {
  constructor(
    readonly client: Client,
    readonly sql: string,
    readonly args: InValue[] = [],
  ) {}
  bind(...args: InValue[]) {
    return new PreparedStatement(this.client, this.sql, args);
  }
  async first() {
    return (await this.all()).results[0] ?? null;
  }
  async all() {
    return result(
      await this.client.execute({ sql: this.sql, args: this.args }),
    );
  }
  run() {
    return this.all();
  }
}

export function createDatabase(client: Client): Database {
  return {
    prepare: (sql) => new PreparedStatement(client, sql),
    async batch(statements) {
      if (!statements.length) return [];
      const queries = statements.map((statement) => {
        if (
          !(statement instanceof PreparedStatement) ||
          statement.client !== client
        )
          throw new Error("Cannot batch statements from different databases.");
        return { sql: statement.sql, args: statement.args };
      });
      // A write batch is one transaction; any failed statement rolls it all back.
      return (await client.batch(queries, "write")).map(result);
    },
  };
}
