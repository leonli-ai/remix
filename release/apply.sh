#!/bin/bash

usage()
{
    echo "USAGE: apply.sh"
    echo "Please run this script under release folder to avoid path issue."
}
echo "Path to TF: ${PATH_TO_TF}"
cd "${PATH_TO_TF}" || exit
terragrunt run-all apply --terragrunt-source-update --terragrunt-non-interactive
