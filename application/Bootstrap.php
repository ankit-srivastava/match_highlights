<?php
ini_set('display_errors', '1');
error_reporting(E_ALL ^ E_NOTICE);
require_once "site_constants.php";
//require_once('Mongo/Mongo_ModelBase.php');
class Bootstrap extends Zend_Application_Bootstrap_Bootstrap
{
    protected function _initAutoload()
    {
          // Add autoloader empty namespace
          $autoLoader = Zend_Loader_Autoloader::getInstance();
          $autoLoader->registerNamespace('CMS_');
          $resourceLoader = new Zend_Loader_Autoloader_Resource(array(
          'basePath' => APPLICATION_PATH,
          'namespace' => '',
          'resourceTypes' => array(
          'form' => array(
          'path' => 'forms/',
          'namespace' => 'Form_',),'model' => array('path' => 'models/','namespace' => 'Model_'),),));
          // Return it so that it can be stored by the bootstrap
          return $autoLoader;
    }
    
    public function initSession()
    {
        $session= Globals::getSession();
    
    }
    
}