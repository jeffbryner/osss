#! /usr/bin/env python

import argparse
import base64
import markdown
import os
import sys
import yaml
from bs4 import BeautifulSoup
from github import Github
from urllib.parse import urlparse
from datetime import datetime, timedelta
from pymongo import MongoClient

g = Github(os.environ.get("GITHUB_API_KEY",None))

class DotDict(dict):
    """
    dict.item notation for dict()'s
    """
    __getattr__ = dict.__getitem__
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__

    def __init__(self, dct):
        for key, value in list(dct.items()):
            if hasattr(value, 'keys'):
                value = DotDict(value)
            self[key] = value

    def __getstate__(self):
        return self.__dict__

def summarizeRepo(url):
    '''
    Given a github url, attempt to get the name and parse the readme into a summary for the repo
    '''
    urlbits=urlparse(url)
    summary = None
    name = None
    if urlbits.netloc.lower() == 'github.com':
        try:
            repo = g.get_repo(urlbits.path[1::])
            name = repo.name
            summary = repo.description + ' '
            readme=base64.b64decode(repo.get_readme().content)
            html=markdown.markdown(readme.decode('utf-8'))
            soup = BeautifulSoup(html)
            tags=[]
            for tag in soup.find_all(True):
                tags.append(tag.name)

            if 'h2' in tags:
                summary+=soup.h2.string + ' '

            for p in soup.find_all('p'):
                if (p.string):
                    if not summary:
                        summary=''
                    summary+= p.string
                    break
        except Exception as e:
            print("{}".format(e))
            return None, None
    return name, summary

def scoreHealth(url):
    urlbits=urlparse(url)
    score=0
    if urlbits.netloc.lower() == 'github.com':
        try:
            repo = g.get_repo(urlbits.path[1::])
            if repo.has_issues and repo.get_issues(state='closed').totalCount > repo.get_issues(state='open').totalCount:
                score+=1
            if repo.get_pulls(state="closed").totalCount > repo.get_pulls(state="open").totalCount:
                score+=1
            lastupdate=datetime.now() - repo.updated_at
            if lastupdate.days<30:
                score+=1
            if repo.get_releases().totalCount > 0:
                score +=1
            if repo.subscribers_count > 0:
                score +=1
            if repo.forks > 0:
                score +=1
            if config.debug:
                print (repo,score)
        except Exception as e:
            print("{}".format(e))
            return None
    return score

def rateHealth(score):
    '''
    given a score, return a color ranking
    '''
    if score:
        if score >= 4:
            return 'green'
        elif score >= 2 and score < 4:
            return 'yellow'
        else:
            return 'red'
    else:
        return 'unknown'

def main(config):
    # connect to mongo
    client = MongoClient(config.mongohost, config.mongoport)
    db=client.meteor
    solutions=db['solutions']
    # get new entries without health ratings
    new_entries = solutions.find({"$or":[{"health":"unknown"},{"health":"pending"}]})
    for entry in new_entries:
        # default
        entry['health']= 'unknown'
        # rank the health
        score=scoreHealth(entry['url'])
        entry['health']=rateHealth(score)
        entry['last_health_check'] = datetime.utcnow().isoformat()
        name, summary=summarizeRepo(entry['url'])
        if name and len(name) > len(entry['name']):
            entry['name']= name
        if summary and len(summary) > len(entry['description']):
            entry['description']= summary
        solutions.replace_one({'_id': entry['_id']},entry)

    # get old entries that need re-checking
    date_range=datetime.utcnow() - timedelta(days=1)
    refresh_entries = solutions.find({'last_health_check': {"$lte": date_range.isoformat()}})
    for entry in refresh_entries:
        # rank the health

        score=scoreHealth(entry['url'])
        entry['health']=rateHealth(score)
        entry['last_health_check'] = datetime.utcnow().isoformat()
        solutions.replace_one({'_id': entry['_id']},entry)

    # todo: update the description if it's changed.

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-c', '--config', help='Specify a configuration file')
    args = parser.parse_args()
    with open(args.config or '{}'.format(sys.argv[0].replace('.py', '.yml'))) as fd:
        config = DotDict(yaml.load(fd))
    if config.debug:
        print(config)
    main(config)