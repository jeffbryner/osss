# What?
This is a proof of concept app to attempt a catalog of open source solutions
in a way that adds category context taken from OWASP's cyber defense matrix ( https://www.owasp.org/index.php/OWASP_Cyber_Defense_Matrix)
and does rudimentary health ratings for projects based on github stats.


# Where ?
Visit:
https://catalog.security.mozilla.org/

and add or edit your favorite open source information security project/tool. Ideally, it's one
that can be used in an enterprise defensive setting as a significant contribution to an organizations
security platform (i.e. not just nmap (though nmap is awesome))

If you enter a github url, the system will automagicaly retrieve the name, description from the project and rank it according to the following health stats:
1) More closed issues than open issues
2) More closed PRs than open PRs
3) Updated in the last 30 days
4) Has releases
5) Has subscribers
6) Has forks

More than 4 of the above gets a green rating, 2-4 a yellow rating, and below 2 a red rating.

# Development
using docker: https://hub.docker.com/r/0x7eff/open-source-catalog-demo/

```
docker pull 0x7eff/open-source-catalog-demo
docker docker run -p80:3000 0x7eff/open-source-catalog-demo
```

For development you can also install meteor ( https://www.meteor.com/)
and run meteor after checking out this repo to do live development.
