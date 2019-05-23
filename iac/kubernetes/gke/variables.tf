variable "project_id" {
  description = "Project ID in GCP"
}

variable "region" {
  description = "Region in which to manage GCP resources"
}

variable "project_name" {
  description = "The name from which the resources and tags will be based off of"
}

variable "zone" {
  description = "The zone in which nodes specified in initial_node_count should be created in"
}

variable "node_count" {
  description = "The number of nodes in the cluster"
}

variable "machine_type" {
  description = "The machine type to be used for each node"
}
