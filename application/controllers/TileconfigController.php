<?php
class TileconfigController extends Zend_Controller_Action
{
  //Initialises model object
  public function init()
  {
    $this->getHelper('viewRenderer')->setNoRender();
  }
 
  public function indexAction()
  {
    $section_type   = $this->_getParam('section_type');
    $sport_name     = $this->_getParam('sport');
    $contest_id     = $this->_getParam('contest');
    $contest_array  = explode('-', $contest_id);
    $contest_id     = $contest_array[1];

    $this->objModel = new Model_Tileconfig();
    $is_live = $this->objModel->isContestLive($contest_id);  
    
    if($section_type=='contest' && $contest_id && $sport_name=='cricket' && $is_live == false) // && $is_live == false
    {
  
      $response_arr=array(array(
                         ':type'=>'application/vnd.playup.extension+json',
                          ':uid'=>'tile.timestamp.scorecard-1',
                          'name'=>'Score Card',
                          ':display'=>array(
                                            ':self'           => BASE_URL.'tileconfig',
                                            ':type'           => "application/vnd.playup.display.tile.timestamp+json",
                                            'background_color'=> "0xE5F4F7",
                                            'title'           => "Score Card",
                                            'summary'         => "",
                                            'image'           =>  BASE_URL."assets/images/graphic_scoreboard.png",
                                            'time_stamp'      =>  date('c'),
                                            ),
                          ':tags'=>array('tile'),
                          'link'=>array(
                                        ':type'=> "text/html",
                                        ':self'=> BASE_URL.'commentary.html?contest_id='.$contest_id,
                                        ),

      )); 
    }
    else
    {
      $response_arr=array();
    }
    echo $output=json_encode($response_arr);
  }

 
  
}