#!/bin/bash

usage()
{
    echo "USAGE: plan.sh"
    echo "Please run this script under release folder to avoid path issue."
}

echo "Path to TF: ${PATH_TO_TF}"
cd "${PATH_TO_TF}" || exit
terragrunt run-all init --terragrunt-source-update --terragrunt-non-interactive
terragrunt run-all plan --terragrunt-source-update --terragrunt-non-interactive
