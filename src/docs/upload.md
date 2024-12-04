Task 2 – Upload Source File to OSS
The Object Storage Service (OSS) is a generic Cloud Storage Service that is part of the Data Management API. In this task, you upload a Zip file containing an Inventor model to OSS. While you can use any model, we recommend that you use the zip file we provide ( Stapler.zip ) for this walkthrough. You can download this file from the walkthrough_data folder of the GitHub repository containing the Postman Collection for this walkthrough.

By the end of this task you will be able to:

Create a Bucket to store the files.
Obtain a signed URL to upload a file to the bucket.
Upload a file to the Bucket.
Obtain the URN of the uploaded file.
Convert the URN to a Base64-encoded URN.

You will use the following operations in this task:

Operation	HTTP Request
Create a Bucket	POST /buckets
Get a Signed URL to Upload a File	GET /buckets/{bucketKey}/objects/{objectKey}/signeds3upload
Finalize File Upload	POST /buckets/{bucketKey}/objects/{objectKey}/signeds3upload
Step 1 - Create a Bucket
Before you upload a file to OSS you must create a Bucket. Once the Bucket is created, you can store files in it as Objects.

Request
curl -X POST \
    'https://developer.api.autodesk.com/oss/v2/buckets' \
    -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>' \
    -H 'Content-Type: application/json' \
    -H 'x-ads-region: US' \
    -d '{
        "bucketKey": "<YOUR_BUCKET_KEY>",
        "access": "full",
        "policyKey": "transient"
        }'
Show More
Notes:

You must specify a name for your Bucket. Replace <YOUR_BUCKET_KEY> with a name for the Bucket.
Bucket keys must consist of only lower case characters, numbers 0-9, and the underscore (_) character.
The Bucket key must be unique throughout the OSS service. If the Bucket name is already in use (even by another user) the server returns a 409 Conflict error. In such a case, retry with another Bucket name.

Response
{
    "bucketKey": "<YOUR_BUCKET_KEY>",
    "bucketOwner": "<YOUR_CLIENT_ID>",
    "createdDate": 1571296694595,
    "permissions": [
        {
            "authId": "T05H372IE11Kmkksdh73ndj0qie2f6nib",
            "access": "full"
        }
    ],
    "policyKey": "transient"
}
Show More
Step 2 - Obtain signed URL
To upload a file to an OSS bucket, you need to have a signed upload URL. To obtain a signed URL:

Request
curl -X GET \
    'https://developer.api.autodesk.com/oss/v2/buckets/<YOUR_BUCKET_KEY>/objects/<YOUR_OBJECT_KEY>/signeds3upload?minutesExpiration=<LIFESPAN_OF_URL>' \
    -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>' \
    -H 'Content-Type: application/json'
Notes:

Replace <YOUR_ACCESS_TOKEN> with the access token you obtained in Task 1.
Replace <LIFESPAN_OF_URL> with 10. This will ensure that the signed URL that is returned will be valid for 10 minutes.
Replace <YOUR_OBJECT_KEY> with Stapler.zip, which is the name of the file we recommend that you upload.

Response
  {
      "uploadKey": "<YOUR_UPLOAD_KEY>",
      "uploadExpiration": "2022-04-08T00:00:00Z",
      "urlExpiration": "2022-04-06T17:59:46Z",
      "urls": ["<SIGNED_UPLOAD_URL>"],
      "location": "https://developer.api.autodesk.com/oss/v2/buckets/<YOUR_BUCKET_KEY>/objects/<YOUR_OBJECT_KEY>"
  }
Note down the values returned for uploadKey <YOUR_UPLOAD_KEY> and urls <SIGNED_UPLOAD_URL>. You will use these values in subsequent requests.

Step 3 - Upload the file
Download the file Stapler.zip from https://github.com/autodesk-platform-services/aps-tutorial-postman/tree/master/ModelDerivative_06/walkthrough_data.
Send a request to upload the file to the Bucket.
Request
curl -X PUT \
    '<SIGNED_UPLOAD_URL>'\
    --data-binary '@<PATH_TO_YOUR_FILE_TO_UPLOAD>'
Step 4 - Finalize Upload
To make the uploaded file available for download, you must finalize the upload. To complete the upload:
Request
curl -X POST \
    'https://developer.api.autodesk.com/oss/v2/buckets/<YOUR_BUCKET_KEY>/objects/<YOUR_OBJECT_KEY>/signeds3upload' \
    -H 'Authorization: Bearer <YOUR_ACCESS_TOKEN>' \
    -H 'Content-Type: application/json' \
    -d '{
        "ossbucketKey": "<YOUR_BUCKET_KEY>",
        "ossSourceFileObjectKey": "<YOUR_OBJECT_KEY>",
        "access": "full",
        "uploadKey": "<YOUR_UPLOAD_KEY>"
        }'
Show More

Response
{
    "bucketKey": "<YOUR_BUCKET_KEY>",
    "objectId": "<YOUR_OBJECT_ID>",
    "objectKey": "<YOUR_OBJECT_KEY>",
    "size": "7221597",
    "contentType": "application/octet-stream",
    "location": "https://developer.api.autodesk.com/oss/v2/buckets/<YOUR_BUCKET_KEY>/objects/<YOUR_OBJECT_KEY>",
    "permissions": [
        {
            "authId": "<YOUR_ACCESS_TOKEN>",
            "access": "full"
        }
    ],
    "policyKey": "transient"
}
Show More
Step 3 - Convert the Inventor model URN to a Base64-encoded URN
Most Model Derivative requests require the URN of the source file to be a Base64-encoded URN.

Use this online tool to convert the URN of the source file (The value of objectId you obtained in the previous step).
For further information, see the full list of Base64 variants.

We recommend using the unpadded option (RFC 6920), since it uses URL-safe alphabets. The following example shows a URN, its Base64-encoded form, and its URL safe Base64-encoded form: