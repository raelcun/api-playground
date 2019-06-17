locals {
  cluster_name = "${var.project_name}-cluster"
  vpc_name     = "${var.project_name}-vpc"
  resource_tag = "${var.project_name}"
}

provider "google" {
  version = "~> 1.4.0"
  project = "${var.project_id}"
  region  = "${var.region}"
}

data "google_container_engine_versions" "region" {
  zone = "${var.zone}"
}

resource "google_container_cluster" "primary" {
  name               = "${local.cluster_name}"
  zone               = "${var.zone}"
  initial_node_count = "${var.node_count}"

  node_config {
    oauth_scopes = [
      "https://www.googleapis.com/auth/compute",
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
    ]

    tags         = ["${local.resource_tag}"]
    machine_type = "${var.machine_type}"

    metadata = {
      disable-legacy-endpoints = "true"
    }
  }

  min_master_version = "${data.google_container_engine_versions.region.latest_master_version}"
  node_version       = "${data.google_container_engine_versions.region.latest_node_version}"
  network            = "${google_compute_network.vpc.self_link}"
  subnetwork         = "${local.vpc_name}"

  # configure kubectl to talk to the cluster
  provisioner "local-exec" {
    command = "gcloud container clusters get-credentials ${local.cluster_name} --zone ${var.zone} --project ${var.project_id}"
  }
}

resource "google_compute_firewall" "firewall" {
  name        = "${var.project_name}-port-range"
  network     = "${google_compute_network.vpc.self_link}"
  target_tags = ["${local.resource_tag}"]

  allow {
    protocol = "tcp"
    ports    = ["30000"]
  }

  source_ranges = ["0.0.0.0/0"]
}

resource "google_compute_network" "vpc" {
  name = "${local.vpc_name}"
}
