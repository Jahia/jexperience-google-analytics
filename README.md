<a href="https://www.jahia.com/">
    <img src="https://www.jahia.com/modules/jahiacom-templates/images/jahia-3x.png" alt="Jahia logo" title="Jahia" align="right" height="60" />
</a>

Google Analytics for jExperience 
======================

This project contains all the specific code in order to push data from your jExperience tests directly in google Analytics as events or Experiments.

Build and deploy
-

Simply use the classical modules build and deploy on your server.

```
mvn clean install jahia:deploy -P <yourProfile>
```

where <yourProfile> is the name of the maven profile associated to your DXM server

see the following page for more explanation : https://github.com/Jahia/helloworld

Once your module is deployed on a site you can start configure Google analytics parameters for this website

Prerequisite
-
In order for this module to be started, you need to have :
- jExperience 1.11.0+ (set personalizations and optimisations in your site)
- Google Analytics 2.0.3+ modules installed on your server. (Inject google analytics tag in pages and send pageviews)
 

Configuring Your site to push Events
-
In your site options tab (right click on the site node from edit mode and "Edit" then select "options" tab), you will find 
two google Analytics Sections : 

- The first section (Google Analytics site settings) comes from Google Analytics module and allow you to precise your web property id or 
  Google Analytics site ID (UA-XXXXXXX-XX) used to load google analytics script on page and enables pageviews 
  and jExperience events push.

- The second section (Google Experiments Options) comes from Google Analytics for jExperience and allows you to 
  precise the needed parameters to create experiments from your tests:
  - Account ID (XXXXXXXX) : Your google analytics account ID
  - Profile ID (XXXXXXXXX) : The profile you want to use to create experiments
  - API Key : Your google developper API Key (needed to load and use Google analytics Experiment API)
  - oAuth Key (clientId) : Your google developper oAuth Key (needed to load and use Google analytics Experiment API)
  
  More information on Google Analytics Experiment API here : https://developers.google.com/analytics/devguides/config/mgmt/v3/mgmtReference/management/experiments

Create Experiments from your tests
-
In order to push your personalizations or optimizations as Experiments in Google analytics you first need to declare them as experiments.

As soon as the Google Analytics for jExperience module is deployed on your site, you can go to the Personalization/Optimisation Dashboards
and open any test you want, you will see a "Track as Experiment" button that will allows you to create an Experiment from the test.

Remark : Only the published Tests and variants can be used to create an experiment. 
         Your experiment will be directly started on creation.
         Please note that the experiment can not be modified (you will not be able to add or remove any variant) 
         as google analytics prevent to do so on a started experiment.
         Be sure to have published all the nodes before creating an experiment.

What happens now ?
-

Once you have set the Google analytics settings, your site will push data to Google servers :
- For each page load in live mode (Google Analytics module).
- For each jExperience test (Google Analytics for jExperience module)

The files are injected in your page by a render filter.

2 types of data are pushed to the server : 

1) Page navigation data : Those are classical analytics pushed to track the traffic on your website.

2) Variant display data : Those are pushed when you have page or content personalization or optimization on a page.
   A javascript event is triggered and the display variant information is pushed to Google analytics servers.

3) Created Experiments are pushed with their test events.

What will the events look like ?
-

A Google analytics event is defined by 4 fields : 

1) Event Category : this field will be set automatically by jExperience to : personalization/optimization/page_personalization/page_optimization
2) Event Action : This field will automatically be set to "Display"
3) Event Label : This field will automatically be set to <Test Displayable Name>-<Variant Displayable Name>

What will the experiments look like ?
-
In order to push Experiments jExperience prefill the Google Experiment Object using the following values :
```
{
    'accountId': <Your Account ID>,
    'webPropertyId': <Your web property ID>,
    'profileId': <Your profile ID>,
    'resource': {
        'name': <Test Displayable name>,
        'servingFramework' : 'EXTERNAL',
        'minimumExperimentLengthInDays':90,
        'objectiveMetric': 'ga:pageviews',
        'status': 'RUNNING',
        'trafficCoverage' : 1,
        'variations': []
    }
}
```

Where variations is a table containing the list of variation objects as follow : 
```
{
    'name' : <Variant displayable name>,
    'url':'',
    'status':'ACTIVE'
}
```

Any limitation ? 
-
Besides the limitation of your Google account (access to the different features and plugins as AB testing for example), you will have some technical limitations : 
For example if some web browsers block Google script when they are opened in private mode or using adblockers or tracking blockers.

## Open-Source

This is an Open-Source module, you can find more details about Open-Source @ Jahia [in this repository](https://github.com/Jahia/open-source).
