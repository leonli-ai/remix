BITBUCKET_TAG=$1
INTEGRATION_USER=$2
INTEGRATION_USER_PASSWORD=$3
export PATH_TO_TF=$4
git clone https://$INTEGRATION_USER:$INTEGRATION_USER_PASSWORD@bitbucket.org/aaxisdigital/shopify-b2b-rds-iac.git
./plan.sh
