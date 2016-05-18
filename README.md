BookTrades is a real-time textbook exchange site.

**Note:** BookTrades is beta software. Most of it should work but it's still a little unpolished and you'll probably find some bugs. Use at your own risk :)

# Dev Installation
- Install Meteor (http://docs.meteor.com/#quickstart)
- Clone this Repository ('git clone https://github.com/SaymV/booktrades')
- Run the command 'cd booktrades' (without quotation marks)
- Run the command 'meteor'

# Production Installation

This installation instruction assumes a vanilla ubuntu server instance.

1) Install Node and npm:
 
```
sudo apt-get install python-software-properties 
sudo add-apt-repository ppa:chris-lea/node.js 
sudo apt-get update 
sudo apt-get install nodejs npm
```

2) Install Meteor
```
curl https://install.meteor.com | /bin/sh
```

3) Install MongoDB:
```
sudo apt-get install mongodb
```

4) Install git and checkout this repo
```
sudo apt-get install git
git clone http://github.com/SaymV/booktrades.git
```

5) Bundle and unpack the standalone application
```
cd booktrades
meteor bundle bundle.tgz 
tar -zxvf bundle.tgz 
```

6) Run the app 

For this step, there are some environment variables that must be set.
Because the app must be launched as root to use port 80, the environment variables must be added as root.
Yes, this information is tailored to my Amazon AWS account, and yes, it should remain private.
```
export MONGO_URL='mongodb://localhost:27017/booktrades'
export ROOT_URL='54.235.73.107'
export MAIL_URL='smtp://AKIAJ6QJBECGNIUVNWYQ:ArW3fco4oHVYlfQANf%2FFV72CcSFyh4e1fnqeK1U5aCCS@email-smtp.us-east-1.amazonaws.com:587'
