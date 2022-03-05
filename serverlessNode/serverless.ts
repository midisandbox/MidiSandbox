import type { AWS } from '@serverless/typescript';

import hello from '@functions/hello';

const serverlessConfiguration: AWS = {
  org: 'jdlee022',
  app: 'serverlessnode',
  service: 'serverlessnode',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-s3-sync'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    profile: 'serverlessUser',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
  },
  // import the function via paths
  functions: { hello },
  resources: {
    Resources: {
      MyBucketUpload: {
        Type: 'AWS::S3::Bucket',
        Properties: {
          BucketName: 'midisandboxbucket-01'
        }
      }
    }
  },
  package: { individually: true },
  custom: {
    s3Sync: [{
      bucketName: 'midisandboxbucket-01',
      localDir: 'UploadFiles',
    }],
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
