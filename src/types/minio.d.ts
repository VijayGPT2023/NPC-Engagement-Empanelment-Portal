// Type stub for optional minio dependency (installed only on NICSI VM production)
declare module "minio" {
  export class Client {
    constructor(options: {
      endPoint: string;
      port: number;
      useSSL: boolean;
      accessKey: string;
      secretKey: string;
    });
    bucketExists(bucket: string): Promise<boolean>;
    makeBucket(bucket: string, region?: string): Promise<void>;
    putObject(bucket: string, name: string, buffer: Buffer, size: number): Promise<unknown>;
    removeObject(bucket: string, name: string): Promise<void>;
  }
}
