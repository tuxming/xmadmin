package xmadmin;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class AddLicense {
	
	private static String license = "/*\r\n"
			+ " * MIT License\r\n"
			+ " *\r\n"
			+ " * Copyright (c) 2024 tuxming@sina.com / wechat: angft1\r\n"
			+ " *\r\n"
			+ " * Permission is hereby granted, free of charge, to any person obtaining a copy\r\n"
			+ " * of this software and associated documentation files (the \"Software\"), to deal\r\n"
			+ " * in the Software without restriction, including without limitation the rights\r\n"
			+ " * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\r\n"
			+ " * copies of the Software, and to permit persons to whom the Software is\r\n"
			+ " * furnished to do so, subject to the following conditions:\r\n"
			+ " *\r\n"
			+ " * The above copyright notice and this permission notice shall be included in all\r\n"
			+ " * copies or substantial portions of the Software.\r\n"
			+ " *\r\n"
			+ " * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\r\n"
			+ " * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\r\n"
			+ " * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\r\n"
			+ " * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\r\n"
			+ " * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\r\n"
			+ " * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\r\n"
			+ " * SOFTWARE.\r\n"
			+ " *\r\n"
			+ " */\r\n\r\n";
	
	
	public static void main(String[] args) throws Exception {
		String path = "D:\\work\\xmadmin\\codebase\\admin\\src";
//		String path = "D:\\work\\xmadmin\\codebase\\server\\src\\main";
		
		File file = new File(path);
		insert(file);
	}
	
	public static void insert(File file) throws Exception {
		System.out.println(file.getAbsolutePath());
		if(file.isDirectory() && !file.getName().equals("node_modules")) {
			File[] listFiles = file.listFiles();
			for (File sub : listFiles) {
				insert(sub);
			}
		}else 
//			if(file.getName().endsWith(".java") || file.getName().endsWith(".ts") || file.getName().endsWith(".tsx")){
			if(file.getName().endsWith(".css")){
			
			Path path = Paths.get(file.getAbsolutePath());
			
			byte[] fileContent = Files.readAllBytes(path);
			

            // 将文件内容转换为字符串
            String originalContent = new String(fileContent, StandardCharsets.UTF_8);
            if(originalContent.startsWith("/*")) {
            	return;
            }

            // 在文件内容前面插入新的文本
            String newContent = license + originalContent;

            // 将新的内容写回文件
            Files.write(path, newContent.getBytes(StandardCharsets.UTF_8));
		}
	}
	
	
}
