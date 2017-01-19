<?php

$req = json_decode($_POST['req']);

$filters = $req->filters;
$sorts = $req->sorts;
$itemPerPage = $req->itemPerPage;

$users = getUsers($filters, $sorts, $itemPerPage);

header('Content-Type: application/json');
echo json_encode($users);

function getUsers($filters, $sorts, $itemPerPage)
{

    $db = new PDO('sqlite:database.sqlite');

    $query = 'SELECT * FROM users';

    $query = processFilters($query, $filters);

    $query = processSorts($query, $sorts);

    $result = $db->query($query, PDO::FETCH_ASSOC);

    $users = $result->fetchAll();

    return $users;
}

function processFilters($query, $filters)
{
    foreach ($filters as $filter) {
        switch ($filter->type) {
            case 'string':
                $query .= ' where ' . $filter->name . $filter->operator . "'" . $filter->oprand1 . "'";
                break;
        }
    }
    return $query;

}

function processSorts($query, $sorts)
{
    return $query;
}