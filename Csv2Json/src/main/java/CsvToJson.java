import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.opencsv.CSVReader;

import java.io.File;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class CsvToJson {
	public static class VHData {
		List<String> tiers = Arrays.asList("meadows", "black forest", "swamp", "mountain", "plains", "mistlands");

		List<List<String>> resourceTiers = Arrays.asList( //
			Arrays.stream("raspberries\thoney\tneck tail\tboar meat\tdeer meat\tfish\tgreydwarf eye\tmushroom\tdandelion\tcoal".split("\t")).map(String::trim).collect(Collectors.toList()), // 1 meadows
			Arrays.stream("blueberries\tcarrot\tyellow mushroom\tthistle".split("\t")).map(String::trim).collect(Collectors.toList()), // 2 black forest
			Arrays.stream("turnip\tooze\tentrails\tbloodbag\tserpent meat".split("\t")).map(String::trim).collect(Collectors.toList()), // 3 swamp
			Arrays.stream("onion\twolf meat\tfreeze gland".split("\t")).map(String::trim).collect(Collectors.toList()), // 4 mountain
			Arrays.stream("cloudberries \tlox meat\tbarley".split("\t")).map(String::trim).collect(Collectors.toList()), // 5 plains
			Arrays.stream("egg\tchicken meat\tmagecap \tjotun puffs \tseeker meat \thare meat\tblood clot\tsap\troyal jelly\tanglerfish".split("\t")).map(String::trim).collect(Collectors.toList())// 6 mistlands
		);

		Map<String, Food> food = new LinkedHashMap<>();

		public List<String> getTiers() {
			return tiers;
		}

		public void setTiers(List<String> tiers) {
			this.tiers = tiers;
		}

		public List<List<String>> getResourceTiers() {
			return resourceTiers;
		}

		public void setResourceTiers(List<List<String>> resourceTiers) {
			this.resourceTiers = resourceTiers;
		}

		public Map<String, Food> getFood() {
			return food;
		}

		public void setFood(Map<String, Food> food) {
			this.food = food;
		}
	}

	public static class Food {
		String name;
		Integer tier;
		Boolean starred;
		Integer hp;
		Integer stamina;
		Integer eitr;
		String type;
		Integer hpPerSecond;
		Integer durationInMinutes;
		Map<String, Number> resources = new LinkedHashMap<>();

		public Integer getEitr() {
			return eitr;
		}

		public void setEitr(Integer eitr) {
			this.eitr = eitr;
		}

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public Integer getTier() {
			return tier;
		}

		public void setTier(Integer tier) {
			this.tier = tier;
		}

		public Boolean getStarred() {
			return starred;
		}

		public void setStarred(Boolean starred) {
			this.starred = starred;
		}

		public Integer getHp() {
			return hp;
		}

		public void setHp(Integer hp) {
			this.hp = hp;
		}

		public Integer getStamina() {
			return stamina;
		}

		public void setStamina(Integer stamina) {
			this.stamina = stamina;
		}

		public String getType() {
			return type;
		}

		public void setType(String type) {
			this.type = type;
		}

		public Integer getHpPerSecond() {
			return hpPerSecond;
		}

		public void setHpPerSecond(Integer hpPerSecond) {
			this.hpPerSecond = hpPerSecond;
		}

		public Integer getDurationInMinutes() {
			return durationInMinutes;
		}

		public void setDurationInMinutes(Integer durationInMinutes) {
			this.durationInMinutes = durationInMinutes;
		}

		public Map<String, Number> getResources() {
			return resources;
		}

		public void setResources(Map<String, Number> resources) {
			this.resources = resources;
		}
	}

	public static void main(String[] args) {
		try {
			System.out.println(System.getProperty("user.dir"));
			String loc = System.getProperty("user.dir") + "/../";
			VHData data = new VHData();
			File f = new File(loc + "/src/valheim-food.csv");
			System.out.println(f.getCanonicalPath());
			CSVReader reader = new CSVReader(new FileReader(f));
			List<String> h = Arrays.asList(reader.readNext());
			int i = 0;
			for (String[] r : reader.readAll()) {
				i = 0;
				Food food = new Food();
				food.name = opt(r[i++]).trim();
				data.food.put(food.name, food);
				food.tier = Integer.parseInt(opt(r[i++]));
				food.starred = "*".equals(opt(r[i++]));
				String hp = opt(r[i++]);
				if (hp != null && !hp.trim().isEmpty()) {
					food.hp = Integer.parseInt(hp);
				}
				opt(r[i++]);
				String stamina = opt(r[i++]);
				if (stamina != null && !stamina.trim().isEmpty()) {
					food.stamina = Integer.parseInt(stamina);
				}
				opt(r[i++]);
				String type = opt(r[i++]);
				if (type.contains(":")) {
					food.type = "blue";
					food.eitr = Integer.parseInt(type.split(":")[1].trim());
				} else {
					if ("y".equals(type)) {
						food.type = "yellow";
					} else if ("w".equals(type)) {
						food.type = "white";
					} else if ("r".equals(type)) {
						food.type = "red";
					} else if ("m".equals(type)) {
						food.type = "mead";
					} else {
						throw new IllegalArgumentException();
					}
					food.eitr = 0;
				}
				String hpPerSecond = opt(r[i++]);
				if (hpPerSecond != null && !hpPerSecond.trim().isEmpty()) {
					food.hpPerSecond = Integer.parseInt(hpPerSecond);
				}
				String durationInMinutes = opt(r[i++]);
				if (durationInMinutes != null && !durationInMinutes.trim().isEmpty()) {
					food.durationInMinutes = Integer.parseInt(durationInMinutes);
				}
				for (; i < r.length; i++) {
					String nr = opt(r[i]);
					if (nr != null) {
						String resource = h.get(i).trim();
						if (nr == null || nr.trim().isEmpty()) {
							//
						} else if (nr.contains(",")) {
							double c = Double.parseDouble(nr.replace(",", "."));
							food.resources.put(resource, c);
						} else if (nr.contains(".")) {
							double c = Double.parseDouble(nr);
							food.resources.put(resource, c);
						} else {
							int c = Integer.parseInt(nr);
							food.resources.put(resource, c);
						}
					}
				}
			}

			File fo = new File(loc + "/src/assets/valheim-food.json");
			System.out.println(fo.getCanonicalPath());
			try (FileOutputStream fout = new FileOutputStream(fo)) {
				fout.write(new OM().writerFor(data.getClass()).writeValueAsString(data).getBytes());
			}

			StringBuilder style = new StringBuilder();
			{
				String c = "    .tabulator-col[tabulator-field=\"RRR\"] .tabulator-col-title::before,";
				for (List<String> resources : data.resourceTiers) {
					for (String rrr : resources) {
						String string = c.replace("RRR", rrr);
						style.append("\n").append(string);
					}
				}
			}
			{
				String c = "noop {\n"//
					+ "      content: '';\n"//
					+ "      width: 32px;\n"//
					+ "      height: 32px;\n"//
					+ "      background-size: 32px;\n"//
					+ "    }";
				style.append("\n").append(c);
			}
			{
				String c = "    .tabulator-col[tabulator-field=\"RRR\"] .tabulator-col-title::before {\n"//
					+ "      background-image: url('images/RRR.png');\n"//
					+ "    }";
				for (List<String> resources : data.resourceTiers) {
					for (String rrr : resources) {
						String string = c.replace("RRR", rrr);
						style.append("\n").append(string);
					}
				}
			}
			File fos = new File(loc + "/src/assets/valheim-food.css");
			System.out.println(fos.getCanonicalPath());
			try (FileOutputStream fout = new FileOutputStream(fos)) {
				fout.write(style.toString().getBytes());
			}
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}

	@SuppressWarnings("serial")
	public static class OM extends ObjectMapper {
		@SuppressWarnings("deprecation")
		public OM() {
			super(new JsonFactory());
			setSerializationInclusion(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL);
			configure(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
			configure(com.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT, false);
			configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
			configure(com.fasterxml.jackson.core.JsonGenerator.Feature.ESCAPE_NON_ASCII, true);
			setVisibility(getSerializationConfig().getDefaultVisibilityChecker()//
				.withFieldVisibility(JsonAutoDetect.Visibility.ANY)//
				.withGetterVisibility(JsonAutoDetect.Visibility.NONE)//
				.withSetterVisibility(JsonAutoDetect.Visibility.NONE)//
				.withCreatorVisibility(JsonAutoDetect.Visibility.NONE));//
			configure(com.fasterxml.jackson.databind.SerializationFeature.INDENT_OUTPUT, true);
		}
	}

	private static String opt(String string) {
		return string == null || string.trim().length() == 0 ? null : string;
	}
}
