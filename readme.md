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

```
{}
```

`Return`

```
script content
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

`Success or Error Info`

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

`Success or Error Info`
