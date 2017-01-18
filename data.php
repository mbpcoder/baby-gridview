<?php

$req = json_decode($_POST['req']);

$filters = $req->filters;
$sorts = $req->sorts;

$users = getUsers($filters, $sorts);

return $users;

function getUsers($filters, $sorts)
{
    $query = 'SELECT * FROM users';

    $query = processFilters($query, $filters);

    $users = processSorts($query, $sorts);

    return $users;
}

function processFilters($data, $filters)
{

}

function processSorts($data, $sorts)
{

}