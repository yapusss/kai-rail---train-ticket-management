import sql from 'mssql';

const dbConfig: sql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'polman',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'db_bright',
  port: parseInt(process.env.DB_PORT || '1433'),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', 
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true', 
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool: sql.ConnectionPool | null = null;

class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    try {
      if (!pool) {
        pool = await sql.connect(dbConfig);
        console.log('✅ Database connected successfully');
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  public getPool(): sql.ConnectionPool {
    if (!pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return pool;
  }

  public async executeStoredProcedure(
    procedureName: string,
    parameters: { [key: string]: any } = {}
  ): Promise<any> {
    try {
      const request = this.getPool().request();
      
      Object.keys(parameters).forEach(key => {
        request.input(key, parameters[key]);
      });

      console.log(`🔧 Executing stored procedure: ${procedureName}`, parameters);
      
      const result = await request.execute(procedureName);
      
      console.log(`✅ Stored procedure ${procedureName} executed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Error executing stored procedure ${procedureName}:`, error);
      throw error;
    }
  }

  public async executeQuery(
    query: string,
    parameters: { [key: string]: any } = {}
  ): Promise<any> {
    try {
      const request = this.getPool().request();
      
      Object.keys(parameters).forEach(key => {
        request.input(key, parameters[key]);
      });

      console.log(`🔧 Executing query: ${query}`, parameters);
      
      const result = await request.query(query);
      
      console.log(`✅ Query executed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Error executing query:`, error);
      throw error;
    }
  }

  public async close(): Promise<void> {
    if (pool) {
      await pool.close();
      pool = null;
      console.log('🔌 Database connection closed');
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.executeQuery('SELECT 1 as health_check');
      return result.recordset.length > 0;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }
}

export const databaseService = DatabaseService.getInstance();

databaseService.initialize().catch(console.error);

export default databaseService;
