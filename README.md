mf-google-analytics
===========

This project contains all the Jahia specific web marketing AT-internet components, this way you will be able to track the traffic on your site and push data as AB testing and personalizations to at-internet servers

Build and deploy
----------------

Simply use the classical modules build and deploy on your server.

```
mvn clean install jahia:deploy -P <yourProfile>
```

where <yourProfile> is the name of the maven profile associated to your DXM server

see the following page for more explanation : https://github.com/Jahia/helloworld

Once your module is deployed on a site you can start configure Google analytics parameters for this website

Configuring Jahia
-----------------

From the site-settings, you will be able to access to a Google analytics section : 

In order for the traffic to be tracked you will need to set 

What happens now ?
------------------

Once you have set the Google analytics settings, your site will push data to Google servers for each page load in live mode.
The files are injected in your page by a render filter.

2 types of data are pushed to the server : 

1) Page navigation data : Those are classical analytics pushed to track the traffic on your website

2) Variant display data : Those are pushed when you have page or content personalization or optimization on a page.
   A javascript event is triggered and the display variant information is pushed to AT-internet server.

Any limitation ? 
----------------

Besides the limitation of your Google account (access to the different features and plugins as AB testing for example), you will have some technical limitations : 
For example if some web browsers block Google script when they are opened in private mode (Firefox is one of them).