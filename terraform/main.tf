terraform {
  required_providers {
    railway = {
      source  = "terraform-community-providers/railway"
      version = "~> 0.6.2"
    }
  }

  cloud {
    organization = "aq-devops"
    workspaces {
      name = "aq-devops"
    }
  }
}

provider "railway" {
  token = var.railway_token
}

resource "railway_project" "aq" {
  name = "aq-devops"
}

resource "railway_service" "app" {
  name         = "app"
  project_id   = railway_project.aq.id
  source_image = "lumbinichathurani/aq-devops:latest"
}

resource "railway_variable" "port" {
  name           = "PORT"
  value          = "3000"
  service_id     = railway_service.app.id
  environment_id = railway_project.aq.default_environment.id
}

resource "railway_variable" "openaq_key" {
  name           = "OPENAQ_API_KEY"
  value          = var.openaq_api_key
  service_id     = railway_service.app.id
  environment_id = railway_project.aq.default_environment.id
}