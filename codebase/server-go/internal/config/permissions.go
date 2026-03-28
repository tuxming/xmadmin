package config

import (
	"os"
	"path/filepath"

	"github.com/BurntSushi/toml"
)

type PermItem struct {
	Name       string `toml:"name"`
	Expression string `toml:"expression"`
	GroupName  string `toml:"groupName"`
}

type PermsConfig struct {
	Permissions []PermItem `toml:"permissions"`
}

var Perms PermsConfig

func LoadPerms() error {
	baseDir, err := findBaseDir()
	if err != nil {
		return err
	}

	paths := []string{
		filepath.Join(baseDir, "assets", "permissions.toml"),
		filepath.Join(baseDir, "..", "..", "assets", "permissions.toml"),
		filepath.Join(baseDir, "..", "..", "..", "assets", "permissions.toml"),
		"assets/permissions.toml",
		"../../assets/permissions.toml",
	}

	var tomlPath string
	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			tomlPath = p
			break
		}
	}

	if tomlPath == "" {
		return nil
	}

	fileData, err := os.ReadFile(tomlPath)
	if err != nil {
		return err
	}

	if err := toml.Unmarshal(fileData, &Perms); err != nil {
		return err
	}
	return nil
}

func GetAllPerms() []PermItem {
	return Perms.Permissions
}

