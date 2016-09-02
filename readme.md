# TASK SERVER

## What does task server do
* Basically it retrieve task from server then distribute to users to finish and store feedback
* Uses Redis

## How to start
* Run `npm install` to install all the dependencies
* Make sure you configure in `/serverjs/config.js` first
* Run `node /serverjs/admininit.js` to set up admin
* Run `npm start` to start server at localhost:3000, change url in `/bin/www`



## request data format
* POST /requesttask

```
{
  "taskCount": 1,
  "client": {
         "id": "client_1",
         "password": "123456"
         }
}
```

`Return`

```
[
    {
        "taskId": "d90a72bf-608f-4fc8-a95d-26b6b3913893",
        "uid": "cb9c77d3-fc28-4be9-9917-1fa3ed6bf74a",
        "ts": "2015-01-01 00:00:00",
        "data": {
            "searchNo": "CNLF005025",
            "searchType": "craw.auto"
        }
    }
]
```

* POST /requestscript

```
{
  "client":{
    	"id": "client_1",
    	"password": "123456"
    },
    "taskId": "some uuid"
}
```

`Return`

```
{
   "script": "script content",
    "ts": "2015-01-01 11:11:11"
}
```

* POST /requestboth

```
{
  "taskCount": 1,
  "client":{
    	"id": "client_1",
    	"password": "123456"
    },
    "taskId": "some uuid"
}
```

`Return`

```
{
    "taskRes": [
        {
            "taskId": "414dc4eb-5586-4e45-8906-67e64e14018c",
            "uid": "c0cfd5ad-8ec8-4deb-8e74-0eb24599ea95",
            "ts": "2015-01-01 00:00:00",
            "data": {
                "searchNo": "CNLF005025",
                "searchType": "craw.auto"
            }
        }
    ],
    "scriptRes": {
        "script": "script content",
        "ts": "2015-01-01 00:00:00"
    }
}
```

* POST /report

```
{
  "status": "success",
   "client":{
     	"id": "client_1",
     	"password": "123456"
     },
  "data":[{
  	"taskId":"fc90991a-f4a9-482d-a687-310e4fac0b0c",
  	"result":"this is new yo"
  }]
}
```

`Return`

```
{
    "status": "some status"
}
```
> data can be array or json

* POST /customerrequest

```
{
	 "customer":{
       	"id": "yunkai",
       	"verifyCode": "123456"
       },
      "uidSet":[]
}
```

> if !uidSet , default return all data

`Return`

```
{
	"uid":"uid content",
	"uid1":"uid1 content"
}
```

* POST /filltask

```
{
  "customer": {
    "id": "YUNK",
    "verifyCode": "123456"
  },
  "template": {
    "id": "26301",
    "script": "script content",
    "ts":"2015-01-01 00:00:00"
  },
  "priority": "low",
  "data": [
    {
      "searchNo": "CNLF005025",
      "searchType": "craw.auto"
    }
  ]
}
```

`Return`

```
{
    "status": "some status"
}
```

* GET /taskqueue

`Params`

```
@type: 'high' / 'low' / 'handling' / not given
@count: a number / not given
```

`Returns`

```
{
    "highRes": [
        {
            "template": {
                "templateId": "test",
                "content": "test"
            },
            "customerData": {
                "uid": "a6ecfa2b-62d5-43b5-b87e-7d4aebb10f7f",
                "customerId": "lifeng"
            },
            "taskId": "f14836c8-5922-4030-b0dc-201053b42584"
        }
    ],
    "lowRes": [
        {
            "template": {
                "templateId": "test",
                "content": "test"
            },
            "customerData": {
                "uid": "f9409d9c-14c6-48e8-b3d2-fa4544449043",
                "customerId": "keyun"
            },
            "taskId": "ccd5cca7-0bf5-4897-9012-38d040280ce5"
        }
    ],
    "handlingRes": [
        {
            "template": {
                "templateId": "test",
                "content": "test"
            },
            "customerData": {
                "uid": "42f62bf6-d716-410d-8cb3-bb14d12491bd",
                "customerId": ""
            },
            "taskId": "21ae852c-2f0b-4476-8763-85bca9181761"
        }
    ]
}
```
