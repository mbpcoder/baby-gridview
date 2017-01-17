<?php

$req = json_decode($_POST['req']);

$filters = $req->filters;

$users = getUsers();

function processFilters()
{

}

function processSorts()
{

}

function getUsers()
{
    $users = [];
    $user = new stdClass();
    $user->name = 'ali';
    $user->age = 20;
    $users[] = $user;

    $user = new stdClass();
    $user->name = 'reza';
    $user->age = 39;
    $users[] = $user;

    $user = new stdClass();
    $user->name = 'mahdi';
    $user->age = 32;
    $users[] = $user;

    $user = new stdClass();
    $user->name = 'hamid';
    $user->age = 28;
    $users[] = $user;

    return $users;

}