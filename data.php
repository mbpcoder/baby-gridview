<?php

$req = json_decode($_POST['req']);

$filters = $req->filters;
$sorts = $req->sorts;
$pagination = $req->pagination;

//var_dump($pagination);

$db = new PDO('sqlite:database.sqlite');
$query = 'SELECT * FROM users';
$query = processFilters($query, $filters);

$queryCount = str_replace('*', 'count(*)', $query);
$result = $db->query($queryCount);

$query = processSorts($query, $sorts);

$pagination->total = (integer)$result->fetchColumn();

$query = $query . ' LIMIT ' . $pagination->per_page;
$query = $query . ' OFFSET ' . $pagination->from;

//var_dump($query);
$result = $db->query($query, PDO::FETCH_ASSOC);
//var_dump($result);

$users = $result->fetchAll();


header('Content-Type: application/json');
echo json_encode([
    'data' => $users,
    'pagination' => $pagination,
]);


function processFilters($query, $filters)
{
    $i = 0;
    foreach ($filters as $key => $filter) {
        //var_dump($filter);
        if ($i == 0) {
            $query .= ' WHERE ';
            $i++;
        } else {
            $query .= ' AND ';
        }
        switch ($filter->operator) {
            case 'equal':
                $query .= $filter->name . '=' . "'" . $filter->oprand1 . "'";
                break;
            case 'contain':
                $query .= $filter->name . ' LIKE' . " '%" . $filter->oprand1 . "%'";
                break;
            case 'in':
                $str = '(';
                for ($j = 0; $j < count($filter->oprand1); $j++) {
                    $str .= "'{$filters->oprand1[$j]}'";
                    if ($j != count($filter->oprand1) - 1) {
                        $str .= ' , ';
                    }
                }
                $str .= ')';
                $query .= $filter->name . ' IN ' . $str;
                break;
            case 'smaller':
                $query .= $filter->name . ' <= ' . "$filter->oprand1";
                break;
            case 'greater':
                $query .= $filter->name . ' >= ' . $filter->oprand1;
                break;
            case 'between':
                $query .= $filter->name . ' BETWEEN ' . $filter->oprand1 . ' AND ' . $filter->oprand2;
                break;
        }
    }
    return $query;

}

function processSorts($query, $sorts)
{
    foreach ($sorts as $name => $type) {
        $query .= ' ORDER BY ' . $name . ' ' . $type;
    }

    return $query;
}