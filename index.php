<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
<title>QuizCross Minimax</title>

<link href="/css/bootstrap.css" type="text/css" media="screen" rel="stylesheet" />
<link href="/quizcross/qc.css" type="text/css" media="screen" rel="stylesheet" />
</head>

<body>
<div class="container">
  <div class="header">
    <ul class="nav nav-pills pull-right">
    </ul>
    <h3 class="text-muted">QuizCross</h3>
  </div><!-- /header-->
  <div class="jumbotron">
    <h1>QuizCross Minimax</h1>
    <p>The tic tac toe element of QuizCross seems a bit gimmicky at first, but after you play a while, you realize that your strengths and weaknesses in individual categories can drastically affect strategy on a given board. Using the minimax algorithm, we can determine the optimal play based on the percentages of you and your opponent.</p>
  </div><!-- /jumbotron -->

  <div class="row forms">
    <div class="col-lg-12">
      <form class="form-horizontal" role="form" id="form">
        <h4>Your Percentages</h4>
        <?php
        $cats = array("geography", "science", "trivia", "sport", "music", "history", "entertainment");
        foreach ($cats as $cat):
        ?>
        <div class="form-group">
          <label for="my-<?= $cat ?>" class="col-sm-2 control-label"><?= ucfirst($cat) ?></label>
          <div class="col-sm-10">
            <input required type="number" min=0 max=100 class="form-control" name="my-<?= $cat ?>"  id="my-<?= $cat ?>" placeholder="<?= ucfirst($cat) ?>">
          </div>
        </div>
        <?php endforeach; ?>

        <h4>Opponent's Categories</h4>
        <?php foreach ($cats as $cat): ?>
        <div class="form-group">
          <label for="their-<?= $cat ?>" class="col-sm-2 control-label"><?= ucfirst($cat) ?></label>
          <div class="col-sm-10">
            <input required type="number" min=0 max=100 class="form-control" name="their-<?= $cat ?>" id="their-<?= $cat ?>" placeholder="<?= ucfirst($cat) ?>">
          </div>
        </div>
        <?php endforeach; ?>

        <h4>Board Layout</h4>

        <?php for ($i = 0; $i < 9; $i += 3): ?>
        <div class="form-group row">
          <?php for ($j = 0; $j < 3; $j++): ?>
          <div class="col-xs-3">
            <?php if ($i + $j != 4): ?>
            <select id="cat<?= $i + $j ?>" name="cat<?= $i + $j ?>" class="form-control">
              <?php foreach ($cats as $cat): ?>
              <option><?= ucfirst($cat) ?></option>
              <?php endforeach; ?>
            </select>
            <?php else: ?>
            <select id="cat4" name="cat4" class="form-control" readonly>
              <option>Quizcross</option>
            </select>
            <?php endif; ?>
          </div>
          <?php endfor; ?>
        </div>
        <?php endfor; ?>

        <h4>Board Layout</h4>

        <?php $scores = array("Unplayed", "Me ***", "Me **", "Me *", "Me 0", "Them ***", "Them **", "Them *", "Them 0"); ?>
        <?php for ($i = 0; $i < 9; $i += 3): ?>
        <div class="form-group row">
          <?php for ($j = 0; $j < 3; $j++): ?>
          <div class="col-xs-3">
            <select id="score<?= $i + $j ?>" name="score<?= $i + $j ?>" class="form-control">
              <?php foreach ($scores as $score): ?>
              <option><?= ucfirst($score) ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <?php endfor; ?>
        </div>
        <?php endfor; ?>

        <div class="form-group center">
          <button type="submit" class="btn btn-primary">Submit</button>
        </div>
      </div>
    </form>

    <table class="table table-bordered">
      <tr>
        <td id='option0'>??</td>
        <td id='option1'>??</td>
        <td id='option2'>??</td>
      </tr>
      <tr>
        <td id='option3'>??</td>
        <td id='option4'>Press submit to view probabilities!</td>
        <td id='option5'>??</td>
      </tr>
      <tr>
        <td id='option6'>??</td>
        <td id='option7'>??</td>
        <td id='option8'>??</td>
      </tr>
    </table>

  </div>
</div><!-- /jumbotron -->

<div class="footer">
  <p>© bann.us 2013</p>
</div>

</div><!-- /container -->

<script type="text/javascript" src="/js/jquery.min.js"></script>
<script type="text/javascript" src="helpers.js"></script>
<script type="text/javascript" src="qc.js"></script>
</body>
</html>
