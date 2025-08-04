# Check model_server.py for more parameters

# change parameter
gcloud run services update audio-us-model \
    --region=us-central1 \
    --update-env-vars MODEL=tiny

gcloud run services update audio-us-model-gpu --timeout=600s --region=us-central1

# create new model
gcloud run deploy audio-us-model \
    --image=gcr.io/thesis21kdl/audio-us-model:latest \
    --region=us-central1 \
    --update-env-vars MODEL=large 

# stop service
gcloud run services update audio-us-model \
    --region=us-central1 \
    --no-traffic

# delete service
gcloud run services delete audio-us-model \
    --region=us-central1 \
    --quiet

gcloud init, gcloud auth, gcloud config

# create repo in artifact
gcloud artifacts repositories create audio-us-model --repository-format docker --project thesis21kdl --location asia-southeast1
# Run cloudbuild
gcloud builds submit --config=cloudbuild.yaml --project=thesis21kdl 

