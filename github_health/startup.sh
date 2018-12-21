#! /bin/bash

# fixup this python:3 docker image to run our cron
apt-get update
apt-get -y install cron rsyslog
pip install -r requirements.txt

/etc/init.d/rsyslog start
/etc/init.d/cron start

if [ -n "${GITHUB_API_KEY}" ]; then
    echo 'adding github api key to cron'
    cat <<- EOV > /var/spool/cron/crontabs/root
GITHUB_API_KEY=${GITHUB_API_KEY}
EOV
fi

CRONTAB_ENTRY='
* * * * * /usr/local/bin/python /opt/github_health/assess_health.py'

cat << EOF >> /var/spool/cron/crontabs/root
${CRONTAB_ENTRY}
EOF
chmod 0600 /var/spool/cron/crontabs/root

# log cron jobs
cat << EOF >> /etc/default/cron
EXTRA_OPTS='-L 5'
EOF

# make it go
/etc/init.d/rsyslog restart
/etc/init.d/cron restart

