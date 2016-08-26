#TASK SERVER

##What does task server do
* Basically it retrieve task from server then distribute to users to finish and store feedback
* Uses Redis

##How to start
* Run `npm install` to install all the dependencies
* Make sure you configure in `/public/serverjs/config.js` first
* Run `npm start` to start server at localhost:3000, change url in `/bin/www`



##request data format
* POST /requesttask

```
{
  "taskCount": 1
}
```

`Return`

```
[
    {
        "template": {
            "templateId": "test",
            "content": "test"
        },
        "customerData": {
            "uid": "04afaa30-2943-47a0-977b-4be01ae5cabc",
            "customerId": "lifeng"
        },
        "taskId": "4f08f2f0-7154-4fb4-9e26-49282c3e005e"
    }
]
```

* POST /requestscript

`Return`

```
{
    "script": "some script"
}
```

* POST /requestboth

```
{
  "taskCount": 1
}
```

`Return`

```
{
    "taskRes": [
        {
            "template": {
                "templateId": "test",
                "content": "test"
            },
            "customerData": {
                "uid": "173f7e7e-1334-4a2e-8439-7ff6cbf5520b",
                "customerId": ""
            },
            "taskId": "d564b552-f126-4639-b71a-0d93bf7bd182"
        }
    ],
    "scriptRes": "getdatdasdasdada"
}
```

* POST /report

```
{
  "status": "success",
  "data":[{
  	"taskId":"ec17fcb4-e1d3-4e7e-aaa0-c085eb0b46b0",
  	"customerData":{
  		"customerId":"keyun",
  		"uid":"dasdada"
  	},
  	"result":"dasdasdasdas"
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
	"customerId":"",
	"verifyCode":"",
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
  "priority":"high",
  "data":[{
    "template":
    {
      "templateId": "test",
      "content": "test"
    },
    "customerData": 
    {
      "uid": "unique id",
      "customerId": "keyun"
    }
  }]
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
